import {cloneDeep, debounce} from "lodash";
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {DndProvider} from "react-dnd";
import Backend from "react-dnd-html5-backend";
import MetaTags from "react-meta-tags";
import {useHistory, useParams} from "react-router-dom";
import AuthContext from "../../AuthContext";
import { NOT_FOUND } from "../../constants/routes";
import {withAuthorization} from "../authentication/WithAuthorization";
import NavBar from "../navigation_bar/NavBar";
import R from "../resources/Namespace";
import {algoliaClient} from "../storage_engine/connectors/AlgoliaClientConnector";
import {DocumentStorage, UserPresenceStatus} from "../storage_engine/DocumentStorage";
import {DocumentStorageHelper} from "../storage_engine/helpers/DocumentStorageHelper";
import {PartStorageHelper} from "../storage_engine/helpers/PartStorageHelper";
import {
    deepCopy,
    IDocumentData,
    IPartData,
    IPartVersionData,
    IUserData,
} from "../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../storage_engine/PartStorage";
import {UserStorage} from "../storage_engine/UserStorage";
import Error from "../utils/Error";
import LargeSpinner from "../utils/LargeSpinner";
import {DocumentContextProvider, DocumentSyncStates} from "./DocumentContext";
import Editor from "./Editor";

export function DocumentComponent() {
    const {userHandle, documentSlug} = useParams();
    const history = useHistory();

    const {currentUser} = useContext(AuthContext);

    const selectSubjectsUidsDefault: string[] = [];
    const [stateSelectedSubjectsUids, setSelectedSubjectsUids] = useState(selectSubjectsUidsDefault);

    const [errorState, setErrorState] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [documentUidState, setDocumentUidState] = useState();
    const [documentState, setDocumentState] = useState();
    const [documentSyncState, setDocumentSyncState] = useState();
    const [documentOwner, setDocumentOwner] = useState();
    const [updatedPresence, setUpdatedPresence] = useState(false);

    const [documentPartState, setDocumentPartState] = useState();

    const documentStorage = useMemo(() => new DocumentStorage(), []);
    const partStorage = useMemo(() => new PartStorage(), []);

    const throttledSetDocument = useRef(debounce((
        documentData: IDocumentData) => writeDocument(documentData),
        R.behaviors.storage.writeDelay,
        {leading: true, maxWait: R.behaviors.storage.writeMaxWait})).current;

    function writeDocument(documentData: IDocumentData) {
        setDocumentSyncState({state: DocumentSyncStates.syncing, timestamp: new Date().getTime()});

        documentStorage.setDocument(documentData)
            .then(() => {
                setDocumentSyncState({state: DocumentSyncStates.synced, timestamp: new Date().getTime()});
            })
            .catch((error: string) => {
                setDocumentSyncState({
                    state: DocumentSyncStates.error,
                    timestamp: new Date().getTime(),
                    message: error,
                });
            });
    }

    const writePartDocument = useCallback((partData: IPartData) => {
        setDocumentSyncState({state: DocumentSyncStates.syncing, timestamp: new Date().getTime()});

        partStorage.setPart(partData).then(() => {
            setDocumentSyncState({state: DocumentSyncStates.synced, timestamp: new Date().getTime()});
        }).catch((error: string) => {
            setDocumentSyncState({
                state: DocumentSyncStates.error,
                timestamp: new Date().getTime(),
                message: error,
            });
        });
    }, [partStorage]);

    useEffect(() => {
        fetchDocumentOwner();

        function fetchDocumentOwner() {
            if (userHandle) {
                new UserStorage().getUserByHandle(userHandle).then((userData: IUserData) => {
                    if (userData) {
                        setDocumentOwner(userData);
                    } else {
                        history.push(NOT_FOUND);
                        setErrorState("User not found");
                    }
                });
            }
        }
    }, [userHandle, history]);

    useEffect(() => {
        if (documentSlug && documentOwner) {
            setLoading(true);
            setErrorState("");
            setDocumentState(null);

            documentStorage.getDocumentUidByUserHandleAndSlug(documentOwner.uid, documentSlug)
                .then((documentUid: string) => {
                    setDocumentUidState(documentUid);
                })
                .catch(() => {
                    history.push(NOT_FOUND);
                    setErrorState("Error getting Document Uid");
                });
        }
    }, [documentOwner, documentSlug, documentStorage, history]);

    useEffect(() => {
        if (documentUidState && documentOwner) {
            const unsubscribe = documentStorage.listenToDocumentByUid(documentUidState, callbackSuccess, callbackError);

            return () => unsubscribe();
        }

        function callbackSuccess(documentData: IDocumentData, source: string) {
            setDocumentState(documentData);
            setLoading(false);

            setDocumentSyncState({
                state: DocumentSyncStates.loaded,
                timestamp: new Date().getTime(),
                message: source,
            });
        }

        function callbackError(error: string) {
            setErrorState(error);
        }
    }, [documentOwner, documentStorage, documentUidState]);

    useEffect(() => {
        if (documentState) {
            const unsubscribe = partStorage.listenToPartHeadUpdates(documentState, callbackSuccess);

            return () => unsubscribe?.();
        }

        function callbackSuccess(partVersions: IPartVersionData[]) {
            let updatedElementParts = false;
            (documentState as IDocumentData).elements.forEach((elementData, key, map) => {
                const foundUpdatedPart = partVersions
                    .find((partVersion) => partVersion.part_uid === elementData.part_uid
                        && elementData.part_version === PartStorageHelper.headVersionName);

                if (foundUpdatedPart &&
                    !PartStorageHelper.arePartVersionsEqual(foundUpdatedPart, elementData.part_version_data_cache)) {
                    elementData.part_version_data_cache = foundUpdatedPart;
                    updatedElementParts = true;
                }
            });

            if (updatedElementParts) {
                setDocumentState(deepCopy(documentState));
                throttledSetDocument(documentState);
            }
        }
    }, [documentState, partStorage, throttledSetDocument]);

    useEffect(() => {
        if (documentState && !updatedPresence) {
            propagateUserIsActive(documentState);
        }

        function propagateUserIsActive(documentData: IDocumentData) {
            if (currentUser) {
                DocumentStorageHelper.setPresence(currentUser, documentData, UserPresenceStatus.engaging);
                throttledSetDocument(documentData);
                setUpdatedPresence(true);
            }
        }
    }, [currentUser, documentState, updatedPresence, throttledSetDocument]);

    useEffect(() => {
        if (documentState?.belongs_to_part_uid) {
            const unsubscribe =
                partStorage.listenToPartByUid(documentState.belongs_to_part_uid, callbackSuccess);
            return () => unsubscribe?.();
        }

        function callbackSuccess(partData: IPartData) {
            setDocumentPartState(partData);
            if (partData.archived) {
                algoliaClient.clearCache();
            }
        }
    }, [documentState, partStorage]);

    function wrapSetDocument(documentData: IDocumentData) {
        documentData = cloneDeep(documentData);
        setDocumentState(documentData);

        if (currentUser) {
            DocumentStorageHelper.setPresence(currentUser, documentData, UserPresenceStatus.engaging);
        }

        throttledSetDocument(documentData);
    }

    function wrapSetDocumentPartData(partData: IPartData) {
        setDocumentPartState(partData);

        writePartDocument(partData);
    }

    function wrapSetDocumentOwner(userData: IUserData) {
        const oldUserData = cloneDeep(userData);
        setDocumentOwner(oldUserData);

        new UserStorage().setUser(documentOwner);
    }

    function wrapSetSelectedSubjectsUids(selectedSubjectUids: string[]) {
        setSelectedSubjectsUids(selectedSubjectUids);
        // TODO@Chris Investigate if clonedeep can copy maps
        // const oldSelectedSubjectUidsDeepCopy = CloneDeep(selectedSubjectUids);
        // setSelectedSubjectsUids(oldSelectedSubjectUidsDeepCopy);
    }

    if (errorState) {
        return (
            <Error content={"Error loading document. Message: " + errorState}/>
        );
    } else if (loading) {
        return (
            <LargeSpinner content="Loading Document..."/>
        );
    } else {
        return (
            <DocumentContextProvider value={{
                documentState,
                setDocumentState: wrapSetDocument,
                documentOwner,
                setDocumentOwner: wrapSetDocumentOwner,
                selectedSubjectsUids: stateSelectedSubjectsUids,
                setSelectedSubjectsUids: wrapSetSelectedSubjectsUids,
                documentSyncState,
                setDocumentSyncState,
                documentPartState,
                setDocumentPartState: wrapSetDocumentPartData,
            }}>
                <MetaTags>
                    <title>{documentState.name}</title>
                    <meta name="description" content={documentState.description}/>
                </MetaTags>
                <NavBar/>
                <DndProvider backend={Backend}>
                    <Editor/>
                </DndProvider>
            </DocumentContextProvider>
        );
    }
}

const authCondition = (firebaseAuthUser: any) => true;
export const Document = withAuthorization(authCondition)(DocumentComponent);
