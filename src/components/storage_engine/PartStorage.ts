import {cloneDeep} from "lodash";
import BRANCH_POINT_UID from "../../constants/branchPointUid";
import {GENESIS_TERMINAL_PART_UID} from "../../constants/genesisTerminalPartUid";
import {BaseStorage} from "./BaseStorage";
import {firebaseApp} from "./connectors/FirebaseConnector";
import {DocumentStorage} from "./DocumentStorage";
import {DocumentStorageHelper} from "./helpers/DocumentStorageHelper";
import PartPositionHelper from "./helpers/PartPositionHelper";
import {PartStorageHelper} from "./helpers/PartStorageHelper";
import {ISearchPartData} from "./models/AlgoliaDataModels";
import {
    flatObjectToInterface,
    IDocumentData,
    IElementData,
    IElementTerminalData,
    interfaceDataToObject,
    IPartData,
    IPartVersionData,
    IRouteData,
    IUserData,
    IVector2,
} from "./models/FirebaseDataModels";
import {UserStorage} from "./UserStorage";

export interface IConnection {
    type: ConnectionType;
    looseRouteTerminal?: {
        routeUid: string,
        connectedTo: {
            elementUid: string,
            terminalUid: string,
        },
    };
    looseElementTerminal?: {
        uid: string,
        elementUid: string,
        connectedToRoute: {
            uid: string,
            connectedToElement: {
                uid: string,
                terminalUid: string,
            },
        },
    };
    partDocumentTerminal: {
        uid?: string,
        terminalUid?: string,
        position: IVector2,
    };
}

export enum ConnectionType {
    looseRoute,
    looseElementTerminal,
}

export class PartStorage extends BaseStorage {
    // TODO@Anyone those methods should be collected and be part of a PartData class implementing IPartData
    private static makePartDataFirebaseCompatible(part: IPartData) {
        return {
            uid: part.uid,
            owner_uid: part.owner_uid,
            latest_version: part.latest_version || PartStorageHelper.headVersionName,
            archived: part.archived,
            created_at: part.created_at,
            updated_at: part.updated_at,
        } as IPartData;
    }

    // TODO@Chris:
    // Can algolia use maps or should it also use a flat json object?
    private static makePartVersionDataAlgoliaCompatibleObject(partVersionData: IPartVersionData) {
        return new UserStorage().getUserByUid(partVersionData.owner_uid).then((userData: IUserData | null) => {
            const searchPartData = {
                objectID: partVersionData.part_uid,
                uid: partVersionData.part_uid,
                name: partVersionData.name,
                description: partVersionData.description || "",
                detailed_description: partVersionData.detailed_description || "",
                created_at: partVersionData.created_at,
                terminals: partVersionData.terminals,
                properties: partVersionData.properties,
                archived: false,
                version: partVersionData.version,
            } as ISearchPartData;

            if (userData) {
                searchPartData.owner_name = userData.full_name;
                searchPartData.owner_handle = userData.handle;
            }

            return searchPartData;
        });
    }

    private static createPartDocumentTerminal(terminalPart: IPartVersionData, position: IVector2) {
        return DocumentStorageHelper.createNewElementData(terminalPart, position);
    }

    public setArchiveStateByPartByUid(partUid: string, archived: boolean) {
        this.updatePart(partUid, {archived});
        if (archived) {
            this.deletePartVersionSearchIndex(partUid);
        } else {
            if (partUid !== BRANCH_POINT_UID) {
                this.getPartByUid(partUid).then((part) => {
                    this.getPartVersionByPartUidAndVersion(part.uid, part.latest_version)
                        .then((partVersion) => {
                            if (partVersion) {
                                this.setPartVersionSearchIndex(partVersion);
                            } else {
                                console.error("partVersion does not exist");
                            }
                        });
                });
            }
        }
    }

    public getPartByUid(partUid: string) {
        return this.queryPartByUid(partUid).get().then((result) => {
            return flatObjectToInterface(result.data()) as IPartData;
        });
    }

    public listenToPartByUid(partUid: string,
                             callbackSuccess: (partData: IPartData) => void,
                             callbackError?: (error: string) => void) {
        return this.queryPartByUid(partUid).onSnapshot((querySnapshot) => {
            if (querySnapshot.data()) {
                const partData = flatObjectToInterface(querySnapshot.data()) as IPartData;
                if (partData) {
                    callbackSuccess(partData);
                } else {
                    callbackError?.("Can't find Part Data");
                }
            } else {
                callbackError?.("Can't find Part Data");
            }
        });
    }

    public getPartVersionByPartUidAndVersion(partUid: string, partVersion: string = PartStorageHelper.headVersionName) {
        return this.queryPartVersionsByPartUidAndVersion(partUid, partVersion).get().then((result) => {
            if (result.data()) {
                const partVersionData = flatObjectToInterface(result.data()) as IPartVersionData;
                return partVersionData;
            }
        });
    }

    public listenToPartVersionByPartUidAndVersion(
        partUid: string,
        partVersion: string,
        callbackSuccess: (partVersionData: IPartVersionData) => void,
        callbackError?: (error: string) => void) {
        return this
            .queryPartVersionsByPartUidAndVersion(partUid, partVersion)
            .onSnapshot((querySnapshot) => {
                    if (querySnapshot.data()) {
                        const partVersionData = flatObjectToInterface(querySnapshot.data()) as IPartVersionData;
                        if (partVersionData) {
                            callbackSuccess(partVersionData);
                        } else {
                            callbackError?.("Can't find Part Version Data");
                        }
                    } else {
                        callbackError?.("Can't find Part Version Data");
                    }
                },
                (err) => {
                    callbackError?.(err.message);
                },
            );
    }

    public updateLinkedPart(documentData: IDocumentData) {
        if (documentData.belongs_to_part_uid) {
            new PartStorage()
                .getPartVersionByPartUidAndVersion(documentData.belongs_to_part_uid, PartStorageHelper.headVersionName)
                .then((partVersion) => {
                    if (partVersion) {
                        let newPartVersion = cloneDeep(partVersion);
                        newPartVersion.name = documentData.name;

                        newPartVersion.terminals = DocumentStorageHelper.getTerminalsFromPartDocument(documentData);

                        newPartVersion = this.inheritSymbolResourceFile(newPartVersion, documentData);

                        if (!PartStorageHelper.arePartVersionsEqual(newPartVersion, partVersion)) {
                            new PartStorage().setPartVersion(newPartVersion);
                        }
                    }
                });
        }
    }

    public async createPartFromSubjects(
        hostDocument: IDocumentData,
        elements: IElementData[],
        ownerUserData: IUserData,
    ) {
        const newPartDocument = DocumentStorageHelper.createNewDocumentData(ownerUserData);
        const newPart = PartStorageHelper.createNewPartData(ownerUserData.uid);
        let newPartVersion = PartStorageHelper
            .createNewPartVersionData(newPart.owner_uid, newPart.uid, newPart.latest_version, newPartDocument.name);

        newPartDocument.belongs_to_part_uid = newPart.uid;
        newPartDocument.properties = hostDocument.properties;

        elements.forEach((element) => {
            newPartDocument.elements.set(element.uid, element);
        });

        const elementRoutes = this.getElementsConnectedRoutes(hostDocument, elements);
        newPartDocument.routes = elementRoutes.included;
        const looseRoutes = Array.from(elementRoutes.loose.values());

        const connections = this.identifyConnections(hostDocument, elements, looseRoutes);

        newPartVersion.document_import_uid = newPartDocument.uid;

        const partDocWithTerminalElements = await this.addTerminalElementsToPartDocument(connections, newPartDocument);

        if (!partDocWithTerminalElements) {
            throw new Error("partDocumentWithTerminalElements is undefined");
        }

        newPartVersion.terminals = DocumentStorageHelper
            .getTerminalsFromPartDocument(partDocWithTerminalElements);
        newPartVersion = this.inheritSymbolResourceFile(newPartVersion, newPartDocument);

        await this.createPartAndPartVersion(newPart, newPartVersion);
        await new DocumentStorage().setDocument(partDocWithTerminalElements);
        return { partVersion: newPartVersion, connections };
    }

    public createPartAndPartVersion(part: IPartData, partVersion: IPartVersionData) {
        return this.setPart(part).then(() => {
            return this.setPartVersion(partVersion);
        });
    }

    public setPart(part: IPartData) {
        // TODO@Chris this has to use the same method as in DocumentStorage to set parts
        part.updated_at = new Date().getTime();
        return this.queryPartByUid(part.uid)
            .set(interfaceDataToObject(part))
            .then(() => {
                const attributes = {
                    archived: part.archived,
                };
                this.updatePartVersionSearchIndex(part.uid, attributes);
            });
    }

    public updatePart(partUid: string, attributesToUpdate: any) {
        attributesToUpdate.updated_at = new Date().getTime();
        return this.queryPartByUid(partUid)
            .update(attributesToUpdate).then(() => {
                this.updatePartVersionSearchIndex(partUid, attributesToUpdate);
            });
    }

    public setPartVersion(partVersion: IPartVersionData) {
        return this.queryPartVersionsByPartUidAndVersion(partVersion.part_uid, partVersion.version)
            .set(interfaceDataToObject(partVersion))
            .then(() => {
                this.setPartVersionSearchIndex(partVersion);
                return partVersion;
            });
    }

    public seedPartsDBFromDummyData(parts: IPartVersionData[]) {
        // TODO@Chris fix this version to write partdata in the same way as in document storage
        parts.forEach((partVersion: IPartVersionData) => {
            const part = PartStorageHelper.createNewPartData(partVersion.owner_uid);
            part.uid = partVersion.part_uid;
            part.latest_version = partVersion.version;
            this.createPartAndPartVersion(part, partVersion);
        });
    }

    public listenToUserParts(
        userUid: string,
        callbackSuccess: (versions: IPartData[]) => void,
        callbackError?: (error: any) => void) {

        return this.queryPartsByUserUid(userUid).onSnapshot((querySnapshot: any) => {
            const docs = querySnapshot.docs;
            if (docs) {
                callbackSuccess(docs.map((doc: any) => doc.data()));
            } else {
                callbackError?.("Couldn't find users parts");
            }
        });
    }

    public async incrementPartVersionUsageCount(partVersion: IPartVersionData) {
        this.getObjectFromSearchIndex(partVersion.part_uid, ["use_count"]).then((searchIndexObject: any) => {
            const updatedCount = (searchIndexObject.use_count || 0) + 1;

            this.updatePartVersionSearchIndex(partVersion.part_uid, {use_count: updatedCount});
        });
    }

    public listenToPartVersionsByPartUid(partUid: string,
                                         callbackSuccess: (partVersions: IPartVersionData[]) => void,
                                         callbackError?: (error: any) => void) {

        return this.queryPartVersionsByPartUid(partUid).onSnapshot((querySnapshot: any) => {
                const versions = querySnapshot.docs.map((doc: any) => doc.data());

                callbackSuccess(versions);
            },
            (err: any) => {
                callbackError?.(err);
            });
    }

    public listenToPartHeadUpdates(documentData: IDocumentData,
                                   callbackSuccess: (partVersions: IPartVersionData[]) => void) {
        const elements = Array.from(documentData.elements.values());

        const partUidsToMonitor = elements
            .filter((element) => element.part_version === PartStorageHelper.headVersionName)
            .map((element) => element.part_uid)
            .filter((v, i, a) => a.indexOf(v) === i);

        if (partUidsToMonitor.length > 0) {
            return firebaseApp.firestore().collectionGroup(this.versionsNamespace)
                .where("part_uid", "in", partUidsToMonitor)
                .where("version", "==", PartStorageHelper.headVersionName)
                .onSnapshot((querySnapshot) => {
                    const partVersions = querySnapshot.docs
                        .map((doc) => flatObjectToInterface(doc.data()) as IPartVersionData);
                    callbackSuccess(partVersions);
                });
        }
    }

    public createPartForDocument(user: IUserData, documentData: IDocumentData) {
        const newPart = PartStorageHelper.createNewPartData(user.uid);
        const newPartVersion = PartStorageHelper.createNewPartVersionData(user.uid, newPart.uid, "", documentData.name);

        newPartVersion.document_import_uid = documentData.uid;
        documentData.belongs_to_part_uid = newPart.uid;

        return this.createPartAndPartVersion(newPart, newPartVersion).then((partVersionData) => {
            return {partVersionData, documentData, partData: newPart};
        });
    }

    private inheritSymbolResourceFile(newPartVersion: IPartVersionData, documentData: IDocumentData) {
        const nonTerminalElements = DocumentStorageHelper.getNonTerminalElements(documentData);
        if (nonTerminalElements.length > 0) {
            const referencePartVersion = nonTerminalElements[0].part_version_data_cache;
            if (nonTerminalElements.length === 1 && referencePartVersion.symbol_resource_file) {
                newPartVersion.symbol_resource_file = referencePartVersion.symbol_resource_file || "";
                newPartVersion.properties = referencePartVersion.properties;

                if (newPartVersion.terminals.size > referencePartVersion.terminals.size) {
                    // TODO@Natarius: this might fuck up the order
                    Array.from(referencePartVersion.terminals.values()).forEach((terminal, index) => {
                        Array.from(newPartVersion.terminals.values())[index].position = terminal.position;
                    });
                } else {
                    newPartVersion.terminals = referencePartVersion.terminals;
                }
            }
        }

        return newPartVersion;
    }

    private async addTerminalElementsToPartDocument(connections: IConnection[], newPartDocument: IDocumentData) {
        const genesisTerminalPart = await this.getGenesisTerminal();
        if (!genesisTerminalPart) {
            throw new Error("partVersion does not exist");
        }

        if (newPartDocument.elements.size > 1) {
            connections.forEach((connection) => {
                const terminalPosition = connection.partDocumentTerminal.position;

                const partDocumentTerminal = PartStorage
                    .createPartDocumentTerminal(genesisTerminalPart, terminalPosition);

                if (!partDocumentTerminal) {
                    return;
                }

                connection.partDocumentTerminal.uid = partDocumentTerminal.uid;

                this.linkNewPartTerminalToElement(connection, newPartDocument, partDocumentTerminal);

                newPartDocument.elements.set(partDocumentTerminal.uid, partDocumentTerminal);
            });
        } else if (newPartDocument.elements.size === 1) {
            const partElement: IElementData = newPartDocument.elements.values().next().value;
            const terminals = partElement.part_version_data_cache.terminals;
            terminals.forEach((terminal) => {
                const initialPosition: IVector2 = terminal?.position ?? { x: 0, y: 0 };
                const terminalPosition = PartPositionHelper.getNewElementTerminalPosition(
                    partElement.diagram_position,
                    initialPosition,
                );

                const partDocumentTerminal = PartStorage
                    .createPartDocumentTerminal(genesisTerminalPart, terminalPosition);

                if (!partDocumentTerminal) {
                    return;
                }

                this.linkSingleElementTerminals(newPartDocument, partElement, partDocumentTerminal, terminal.uid);

                newPartDocument.elements.set(partDocumentTerminal.uid, partDocumentTerminal);
            });

        }

        return newPartDocument;
    }

    private getGenesisTerminal() {
        return this.getPartVersionByPartUidAndVersion(
            GENESIS_TERMINAL_PART_UID);
    }

    private linkNewPartTerminalToElement(connection: IConnection,
                                         newPartDocument: IDocumentData,
                                         terminalElement: IElementData) {
        if (connection.type === ConnectionType.looseRoute) {
            const looseRoute = newPartDocument.routes.get(connection.looseRouteTerminal!.routeUid);
            if (looseRoute) {
                const looseRouteTerminal = this.findRouteEndpointTerminal(looseRoute,
                    connection.looseRouteTerminal!.connectedTo.terminalUid);

                if (looseRouteTerminal) {
                    looseRouteTerminal.element_uid = terminalElement.uid;
                    looseRouteTerminal.terminal_uid = terminalElement
                        .part_version_data_cache.terminals
                        .values()
                        .next()
                        .value.uid;
                }
            }
        } else if (connection.type === ConnectionType.looseElementTerminal) {
            if (connection.looseElementTerminal) {
                const newRoute = DocumentStorageHelper.createNewRouteData(
                    terminalElement.uid,
                    terminalElement.part_version_data_cache.terminals.values().next().value.uid,
                    connection.looseElementTerminal.connectedToRoute.connectedToElement.uid,
                    connection.looseElementTerminal.connectedToRoute.connectedToElement.terminalUid,
                    newPartDocument.owner_uid);

                newPartDocument.routes.set(newRoute.uid, newRoute);
            }
        }
    }

    private linkSingleElementTerminals(
        newPartDocument: IDocumentData,
        partElement: IElementData,
        terminalElement: IElementData,
        terminalUid: string,
    ) {
        const newRoute = DocumentStorageHelper.createNewRouteData(
            terminalElement.uid,
            terminalElement.part_version_data_cache.terminals.values().next().value.uid,
            partElement.uid,
            terminalUid,
            newPartDocument.owner_uid,
        );

        newPartDocument.routes.set(newRoute.uid, newRoute);
    }

    private identifyConnections(hostDocument: IDocumentData, elements: IElementData[], looseRoutes: IRouteData[]) {
        const connections = [] as IConnection[];

        this.getTerminalsFromLooseElementsTerminals(hostDocument, elements, looseRoutes, connections);

        return connections;
    }

    private getElementsConnectedRoutes(hostDocument: IDocumentData, elements: IElementData[]) {
        const elementUids = this.getUniqueElementUids(elements);

        const connectedRoutes = {
            included: new Map<string, IRouteData>(),
            loose: new Map<string, IRouteData>(),
        };

        Array.from(hostDocument.routes).forEach(([routeUid, route]) => {
            const { endpoints } = route;

            const startElementUid = endpoints.start_element_terminal.element_uid;
            const endElementUid = endpoints.end_element_terminal.element_uid;

            if (elementUids.has(startElementUid) && elementUids.has(endElementUid)) {
                connectedRoutes.included.set(routeUid, route);
                return;
            }

            if (!(!elementUids.has(startElementUid) && !elementUids.has(endElementUid))) {
                connectedRoutes.loose.set(routeUid, route);
                return;
            }
        });

        return connectedRoutes;
    }

    private getTerminalsFromLooseElementsTerminals(
        hostDocument: IDocumentData,
        elements: IElementData[],
        looseRoutes: IRouteData[],
        connections: IConnection[],
    ) {
        looseRoutes.forEach((route) => {
            const looseElement = this.getElementByConnectedRoute(route, elements);
            const looseElementTerminal = this.getTerminalByRouteAndElement(route, looseElement?.uid);

            const hostTerminal = Object.values(route.endpoints).find((endpoint) => {
                return endpoint.element_uid !== looseElement?.uid;
            });

            const hostElement = hostDocument.elements.get(hostTerminal?.element_uid ?? "");

            if (!looseElement || !looseElementTerminal || !hostTerminal || !hostElement) {
                return;
            }

            connections.push(this.createLooseElementConnection(
                route,
                looseElement,
                looseElementTerminal,
                hostElement,
                hostTerminal,
            ));
        });
    }

    private createLooseElementConnection(
        route: IRouteData,
        looseElement: IElementData,
        looseElementTerminal: IElementTerminalData,
        hostElement: IElementData,
        hostElmentTerminal: IElementTerminalData,
    ): IConnection {
        return {
            type: ConnectionType.looseElementTerminal,
            looseElementTerminal: {
                uid: hostElmentTerminal.terminal_uid,
                elementUid: hostElmentTerminal.element_uid,
                connectedToRoute: {
                    uid: route.uid,
                    connectedToElement: {
                        uid: looseElement.uid,
                        terminalUid: looseElementTerminal.terminal_uid,
                    },
                },
            },
            partDocumentTerminal: {
                uid: looseElementTerminal.terminal_uid,
                terminalUid: looseElementTerminal.terminal_uid,
                position: hostElement.diagram_position,
            },
        };
    }

    private getTerminalByRouteAndElement(route: IRouteData, elementUid?: string) {
        return Object.values(route.endpoints).find((endpoint) => {
            return endpoint.element_uid === elementUid;
        });
    }

    private getUniqueElementUids(elements: IElementData[]) {
        const elementUids = new Set<string>();
        elements.forEach((element) => {
            elementUids.add(element.uid);
        });
        return elementUids;
    }

    private getElementByConnectedRoute(route: IRouteData, elements: IElementData[]) {
        return elements.find((element) => {
            return this.checkRouteElementConnection(route, element.uid);
        });
    }

    private checkRouteElementConnection(route: IRouteData, elementUid: string) {
        return route.endpoints.start_element_terminal.element_uid === elementUid ||
            route.endpoints.end_element_terminal.element_uid === elementUid;
    }

    private findRouteEndpointTerminal(route: IRouteData, terminalUid: string) {
        let endpointTerminal;

        if (route.endpoints.start_element_terminal.terminal_uid === terminalUid) {
            endpointTerminal = route.endpoints.start_element_terminal;
        } else if (route.endpoints.end_element_terminal.terminal_uid === terminalUid) {
            endpointTerminal = route.endpoints.end_element_terminal;
        }
        return endpointTerminal;
    }

    private queryPartVersionsByPartUidAndVersion(partUid: string, partVersion: string) {
        return this.queryPartVersionsByPartUid(partUid)
            .doc(partVersion);
    }

    private queryPartVersionsByPartUid(partUid: string) {
        return this.queryPartByUid(partUid)
            .collection(this.versionsNamespace);
    }

    private queryParts() {
        return firebaseApp.firestore().collection(this.partsNamespace);
    }

    private queryPartByUid(partUid: string) {
        return this.queryParts().doc(partUid);
    }

    private async setPartVersionSearchIndex(part: IPartVersionData) {
        PartStorage.makePartVersionDataAlgoliaCompatibleObject(part).then((indexPart) => {
            this.partSearchIndex.saveObject(
                indexPart,
                (err, content) => {
                    if (err) {
                        console.error(err);
                    }
                });
        });
    }

    private async deletePartVersionSearchIndex(partUid: string) {
        this.partSearchIndex.deleteObject(
            partUid,
            (err, content) => {
                if (err) {
                    console.error(err);
                }
            });
    }

    private async updatePartVersionSearchIndex(partUid: string, attributesToUpdate: ISearchPartData) {
        attributesToUpdate.objectID = partUid;

        this.partSearchIndex.partialUpdateObject(
            attributesToUpdate,
            false,
            (err, content) => {
                if (err) {
                    console.error(err);
                }
            });
    }

    private getObjectFromSearchIndex(partUid: string, attributes?: string[]) {
        return this.partSearchIndex.getObject(partUid, attributes);
    }

    private queryPartsByUserUid(userUid: string) {
        return this.queryParts().where("owner_uid", "==", userUid).where("archived", "==", false);
    }
}
