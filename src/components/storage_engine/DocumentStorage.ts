import {Mutex} from "async-mutex";
import {detailedDiff} from "deep-object-diff";
import {Guid} from "guid-typescript";
import Multimap from "multimap";
import {BaseStorage} from "./BaseStorage";
import {firebaseApp} from "./connectors/FirebaseConnector";
import {DocumentStorageHelper} from "./helpers/DocumentStorageHelper";
// @ts-ignore
import {
    deepCopy,
    flatObjectToInterface,
    IDocumentData,
    IDocumentPropertyData,
    IElementData,
    interfaceDataToObject,
    IRouteData,
    IUserData,
    IUserPresence,
} from "./models/FirebaseDataModels";
import {PartStorage} from "./PartStorage";
import {UserStorage} from "./UserStorage";

export enum UserPresenceStatus {
    lurking,
    engaging,
}

export enum DocumentType {
    all,
    circuit,
    part,
}

interface IChange {
    id: string;
    operation: string;
    object: any;
}

export enum UpdateSource {
    all,
    server,
    local,
}

enum CallbackTuple {
    updateSource,
    callback,
}

export class DocumentStorage extends BaseStorage {
    // doc id; array of unsubscribers
    // @ts-ignore
    private unsubscribers = new Multimap<string, () => void>();

    private documents: Map<string, IDocumentData>;
    // TODO@Chris only use callback map and make it a map in a map to subscribe to multiple documents or so
    private callbacks: Map<string, [UpdateSource, (IDocumentData: IDocumentData, source: string) => void]>;
    private mutex = new Mutex();
    private storageId: string;

    constructor() {
        super();

        this.documents = new Map<string, IDocumentData>();
        this.callbacks = new Map<string, [UpdateSource, (IDocumentData: IDocumentData, source: string) => void]>();
        this.storageId = Guid.create().toString();
    }

    // This method should be called by the user when no real time updates are required anymore
    public unsubscribeFromDocument(documentUid: string) {
        this.callbacks.delete(documentUid);
    }

    public listenToUserDocuments(
        userUid: string,
        type: DocumentType,
        callbackSuccess: (document: IDocumentData[]) => void,
        callbackError: (error: string) => void) {

        let query = this.queryDocumentsByUserUid(userUid);

        if (type === DocumentType.circuit) {
            query = query.where("documentData.belongs_to_part_uid", "==", "");
        } else if (type === DocumentType.part) {
            query = query.where("documentData.belongs_to_part_uid", ">", "");
        }

        return query.onSnapshot((querySnapshot) => {
            const docs = querySnapshot.docs;
            if (docs) {
                callbackSuccess(docs.map((doc) => doc.data().documentData));
            } else {
                callbackError("Couldn't find users documents");
            }
        });
    }

    public setDocument(documentData: IDocumentData) {
        documentData.updated_at = new Date().getTime();
        new PartStorage().updateLinkedPart(documentData);
        return this.setFireBaseDocument(deepCopy(documentData));
    }

    public onDocumentChange(documentUid: string, source: string) {
        // Unsubscribe from document changes if there is no user anymore registered listening
        if (!this.callbacks.get(documentUid)) {
            this.unsubscribeStorageFromDocumentUpdates(documentUid);
        }

        const cb = this.callbacks.get(documentUid);
        if (cb !== undefined &&
            (UpdateSource[cb[CallbackTuple.updateSource]] === source || UpdateSource[UpdateSource.all])) {
            const doc = this.documents.get(documentUid);
            if (doc !== undefined) {
                cb[CallbackTuple.callback](deepCopy(doc), source);
            }
        }
    }

    // Registers a callback and makes sure the callback gets called whenever the source of the document update
    // matches the callOnSource enum. Default is server.
    public subscribeToDocumentChange(documentUid: string, callback: any, callOnSource?: UpdateSource) {
        if (!callOnSource) {
            callOnSource = UpdateSource.server;
        }
        this.callbacks.set(documentUid, [callOnSource, callback]);
    }

    public getDocumentUrlByUid(documentUid: string, relative: boolean = true) {
        return this.queryDocumentByUid(documentUid).get().then((result) => {
            const document = result.data();
            if (document) {
                const documentData = document.documentData;
                return new UserStorage().getUserByUid(documentData.owner_uid).then((user) => {
                    if (user) {
                        if (relative) {
                            return DocumentStorageHelper.getRelativeUrl(user, documentData);
                        } else {
                            return DocumentStorageHelper.getAbsoluteUrl(user, documentData);
                        }
                    }
                });
            }
        });
    }

    public deleteDocument(document: IDocumentData) {
        if (!document.belongs_to_part_uid) {
            this.deleteDocumentByUid(document.uid);
        } else {
            return false;
        }
    }

    public getDocumentUidByUserHandleAndSlug(userUid: string, documentSlug: string) {
        return this.queryDocumentByUserHandleAndSlug(userUid, documentSlug)
            .get()
            .then((querySnapshot: any) => {
                const doc = querySnapshot.docs[0];
                if (doc) {
                    const data = doc.data();
                    if (data) {
                        return Promise.resolve(doc.id);
                    }
                }
            });
    }

    public listenToDocumentByUid(documentUid: string,
                                 callbackSuccess: (document: IDocumentData, source: string) => void,
                                 callbackError: (error: string) => void) {
        this.getDocumentFromFirebase(documentUid).then((documentData) => {
            if (documentData) {
                const source = "server";
                this.subscribeToDocumentChange(documentUid, callbackSuccess);
                callbackSuccess(documentData, source);
            } else {
                callbackError("Document does not exist");
            }
        });
        return () => {
            this.unsubscribeFromDocument(documentUid);
        };
    }

    public async getDocumentFromFirebase(documentUid: string) {
        const baseDocRef = this.queryDocuments()
            .doc(documentUid);
        const emptyUser = {
            uid: "",
        } as IUserData;
        // Create empty document and populate it
        const document = DocumentStorageHelper.createNewDocumentData(emptyUser);
        const basePromise = this.getBaseDocument(baseDocRef);
        const routesPromise = this.getCollection("routes", baseDocRef);
        const elementsPromise = this.getCollection("elements", baseDocRef);
        const activeUsersPromise = this.getCollection("active_users", baseDocRef);
        const propertiesPromise = this.getCollection("properties", baseDocRef);
        return Promise
            .all([basePromise, routesPromise, elementsPromise, activeUsersPromise, propertiesPromise])
            .then((values) => {
                // @ts-ignore
                for (const entry of Object.entries(values[0].documentData)) {
                    const propName = entry[0].toString();
                    const propValue = entry[1];
                    // @ts-ignore
                    document[propName] = propValue;
                }
                document.routes = values[1] as Map<string, IRouteData>;
                document.elements = values[2] as Map<string, IElementData>;
                document.active_users = values[3] as Map<string, IUserPresence>;
                document.properties = values[4] as Map<string, IDocumentPropertyData>;
                this.mutex.acquire().then((release) => {
                    this.documents.set(document.uid, document);
                    this.subscribeToBaseDocument(baseDocRef.id, baseDocRef);
                    this.subscribeToCollection(baseDocRef.id, "properties", "properties", baseDocRef);
                    this.subscribeToCollection(baseDocRef.id, "elements", "elements", baseDocRef);
                    this.subscribeToCollection(baseDocRef.id, "routes", "routes", baseDocRef);
                    this.subscribeToCollection(baseDocRef.id, "active_users", "active_users", baseDocRef);
                    release();
                });
                return Promise.resolve(document);
            });
    }

    // Unsubscribe the storage from listening to document changes
    // Use this after the last user of a document unsubscribed
    private unsubscribeStorageFromDocumentUpdates(documentUid: string) {
        const unsubscribers = this.unsubscribers.get(documentUid);
        unsubscribers.forEach((value: any) => {
            value();
        });
    }

    private getElementDiff(newElements: Map<string, IElementData>, oldElements: Map<string, IElementData>) {
        const changes = new Map<string, IChange>();
        newElements.forEach((value, key) => {
            if (!oldElements.has(key)) {
                changes.set(key, {
                    id: key,
                    operation: "created",
                    object: interfaceDataToObject(value),
                });
            } else {
                const change = detailedDiff(
                    interfaceDataToObject(oldElements.get(key)!), interfaceDataToObject(value));
                // @ts-ignore
                if (Object.entries(change.updated).length !== 0 && change.constructor === Object) {
                    changes.set(key, {
                        id: key,
                        operation: "modified",
                        // @ts-ignore
                        object: change.updated,
                    });
                }
                // @ts-ignore
                if (Object.entries(change.deleted).length !== 0 && change.constructor === Object) {
                    changes.set(key, {
                        id: key,
                        operation: "deleted",
                        // @ts-ignore
                        object: change.deleted,
                    });
                }
                // @ts-ignore
                if (Object.entries(change.added).length !== 0 && change.constructor === Object) {
                    changes.set(key, {
                        id: key,
                        operation: "added",
                        // @ts-ignore
                        object: change.added,
                    });
                }
            }
        });
        oldElements.forEach((value, key) => {
            if (!newElements.has(key)) {
                changes.set(key, {
                    id: key,
                    operation: "removed",
                    object: value,
                });
            }
        });
        return changes;
    }

    private async writeCollection(collectionDocuments: Map<string, any>, collectionName: string,
                                  baseDocRef: firebase.firestore.DocumentReference) {
        const document = this.documents.get(baseDocRef.id);
        let lastObjects: any;
        if (document !== undefined) {
            lastObjects = Object.entries(document).filter(
                (value) => value[0] === collectionName)[0][1];
        }
        const collection = baseDocRef.collection(collectionName);
        const batch = firebaseApp.firestore().batch();
        if (lastObjects !== undefined) {
            lastObjects.forEach((value: any, id: string) => {
                if (!collectionDocuments.has(id)) {
                    batch.delete(collection.doc(id));
                }
            });
        }
        const metadata = {storageId: this.storageId};
        collectionDocuments.forEach((value: any, key: string) => {
            batch.set(collection.doc(key), {data: interfaceDataToObject(value), metadata}, {merge: true});
        });
        return batch.commit().then(() => {
            return Promise.resolve();
        }).catch((error) => {
            console.error("Writing batch failed: " + error);
            return Promise.reject(error);
        });
    }

    private async getCollection(collectionPath: string, baseDocRef: firebase.firestore.DocumentReference) {
        const result: Map<string, any> = new Map<string, any>();
        const collection = await baseDocRef.collection(collectionPath).get();
        for (const doc of collection.docs) {
            if (doc.data() === undefined) {
                continue;
            }
            result.set(doc.id, flatObjectToInterface(doc.data().data));
        }
        return Promise.resolve(result);
    }

    private async subscribeToCollection(documentUid: string,
                                        collectionName: string,
                                        objectName: string,
                                        baseDocRef: firebase.firestore.DocumentReference) {
        const result = baseDocRef
            .collection(collectionName)
            .onSnapshot((querySnapshot) => {
                let source = "server";
                this.mutex.acquire().then((release) => {
                    const doc = this.documents.get(documentUid);
                    querySnapshot.docChanges().forEach((change) => {
                        if (change.doc.data().metadata.storageId === this.storageId) {
                            source = "local";
                        } else {
                            let objectMap;
                            if (doc) {
                                objectMap = Object.entries(doc).filter(
                                    (value) => value[0] === objectName)[0][1];
                            }
                            if (change.type === "added" || change.type === "modified") {
                                if (doc !== undefined) {
                                    objectMap.set(change.doc.id, flatObjectToInterface(change.doc.data().data));
                                }
                            }
                            if (change.type === "removed") {
                                if (doc !== undefined) {
                                    objectMap.delete(change.doc.id);
                                }
                            }
                        }
                    });
                    if (doc !== undefined && source === "server") {
                        this.documents.set(documentUid, doc);
                        this.onDocumentChange(documentUid, source);
                    }
                    release();
                });
            });
        this.unsubscribers.set(baseDocRef.id, result);
    }

    private async subscribeToBaseDocument(documentUid: string, baseDocRef: firebase.firestore.DocumentReference) {
        const result = baseDocRef.onSnapshot((snapshot) => {
            const changes = snapshot.data();
            if (!changes) {
                console.error("Failed to get base document updates");
            }
            let source = "server";
            if (changes!.metadata.storageId === this.storageId) {
               source = "local";
            }
            if (source === "server") {
                this.mutex.acquire().then((release) => {
                const doc = this.documents.get(documentUid);
                if (doc !== undefined) {
                    // @ts-ignore
                    for (const entry of Object.entries(changes.documentData)) {
                        const propName = entry[0].toString();
                        const propValue = entry[1];
                        // @ts-ignore
                        doc[propName] = propValue;
                    }
                    this.documents.set(documentUid, doc);
                    this.onDocumentChange(documentUid, source);
                }
                release();
                });
        }
        });
        this.unsubscribers.set(baseDocRef.id, result);
    }

    private async getBaseDocument(baseDocRef: firebase.firestore.DocumentReference) {
        return baseDocRef.get().then((snapshot) => {
            if (snapshot.data()) {
                return snapshot.data();
            }
        });
    }

    private async writeBaseDocument(documentData: IDocumentData, baseDocRef: firebase.firestore.DocumentReference) {
        const obj: any = {};
        for (const entry of Object.entries(documentData)) {
            if (!(entry[1] instanceof Map)) {
                Object.defineProperty(obj, entry[0], {
                    value: entry[1],
                    writable: true,
                    enumerable: true,
                });
            }
        }
        const metadata = {storageId: this.storageId};
        return baseDocRef.set({documentData: obj, metadata}, {merge: true});
    }

    private async setFireBaseDocument(documentData: IDocumentData) {
        const baseDocRef = this.queryDocuments().doc(documentData.uid);

        const promiseBase = this.writeBaseDocument(documentData, baseDocRef);
        const promiseElements = this.writeCollection(documentData.elements,
            "elements", baseDocRef);
        const promiseRoutes = this.writeCollection(documentData.routes,
            "routes", baseDocRef);
        const promiseProperties = this.writeCollection(documentData.properties,
            "properties", baseDocRef);
        const promiseActiveUsers = this.writeCollection(documentData.active_users,
            "active_users", baseDocRef);

        Promise
            .all([promiseBase, promiseRoutes, promiseElements, promiseProperties, promiseActiveUsers])
            .then(() => {
                this.mutex.acquire().then((release) => {
                    this.documents.set(documentData.uid, documentData);
                    release();
                });
                return Promise.resolve();
            });
    }

    private deleteDocumentByUid(documentUid: string) {
        // Todo This is a bug since it does not delete the subcollections in this document.
        return this.queryDocumentByUid(documentUid).delete();
    }

    private queryDocumentByUid(documentUid: string) {
        return this.queryDocuments()
            .doc(documentUid);
    }

    private queryDocumentsByUserUid(userUid: string) {
        return this.queryDocuments()
            .where("documentData.owner_uid", "==", userUid);
    }

    private queryDocumentByUserHandleAndSlug(userUid: string, documentSlug: string) {
        return this.queryDocuments()
            .where("documentData.owner_uid", "==", userUid)
            .where("documentData.slug", "==", documentSlug);
    }

    private queryDocuments() {
        return firebaseApp.firestore()
            .collection(this.documentNamespace);
    }
}
