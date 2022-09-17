import React from "react";
import {IDocumentData, IPartData, IUserData} from "../storage_engine/models/FirebaseDataModels";

export enum DocumentSyncStates {
    none,
    loaded,
    syncing,
    synced,
    error,
    offline,
}

export interface IDocumentSyncState {
    state: DocumentSyncStates;
    timestamp: number;
    message?: string;
}

interface IContextProps {
    documentState: IDocumentData;
    setDocumentState: (documentData: IDocumentData) => void;
    documentOwner: IUserData;
    setDocumentOwner: (userData: IUserData) => void;
    selectedSubjectsUids: string[];
    setSelectedSubjectsUids: (selectedSubjectsUids: string[]) => void;
    documentSyncState: IDocumentSyncState;
    setDocumentSyncState: (syncState: IDocumentSyncState) => void;
    documentPartState: IPartData;
    setDocumentPartState: (partData: IPartData) => void;
}

const DocumentContext = React.createContext<Partial<IContextProps>>({});

export const DocumentContextProvider = DocumentContext.Provider;
export const DocumentContextConsumer = DocumentContext.Consumer;
export default DocumentContext;
