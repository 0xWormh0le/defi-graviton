import InputBase from "@material-ui/core/InputBase";
import React, {useContext, useEffect, useState} from "react";
import DocumentContext from "../../../editor/DocumentContext";
import R from "../../../resources/Namespace";
import {firebaseApp} from "../../../storage_engine/connectors/FirebaseConnector";
import {DocumentStorage, DocumentType} from "../../../storage_engine/DocumentStorage";
import {DocumentStorageHelper} from "../../../storage_engine/helpers/DocumentStorageHelper";
import {IDocumentData, IUserData} from "../../../storage_engine/models/FirebaseDataModels";
import Error from "../../../utils/Error";

export default function DocumentNameEditor() {
    const context = useContext(DocumentContext);
    const documentData = context.documentState;
    const setDocumentData = context.setDocumentState;
    const documentOwner = context.documentOwner;

    const [documentName, setDocumentName] = useState(documentData?.name);
    const [documentsState, setDocumentsState] = useState();
    const [validationError, setValidationError] = useState(false);
    const [errorState, setErrorState] = React.useState("");

    const isAnonUser = firebaseApp.auth().currentUser?.isAnonymous;

    useEffect(() => {
        if (documentOwner && documentData) {
            setDocumentName(documentData.name);

            window.history.replaceState(
                "",
                document.title,
                DocumentStorageHelper.getRelativeUrl(documentOwner, documentData),
            );
        }
    }, [documentData, documentOwner]);

    useEffect(() => {
        if (documentOwner) {
            const unsubscribe = new DocumentStorage()
                .listenToUserDocuments(documentOwner.uid, DocumentType.all, callbackSuccess, callbackError);
            return () => unsubscribe();
        }

        function callbackSuccess(documents: IDocumentData[]) {
            setErrorState("");
            setDocumentsState(documents);
        }

        function callbackError(error: string) {
            setErrorState(error);
        }
    }, [documentOwner]);

    function updateDocumentState(documentState: IDocumentData, owner: IUserData, newDocumentName: string) {
        DocumentStorageHelper.setDocumentName(documentState, newDocumentName);
        const documentNameExists = documentsState
            .filter((document: IDocumentData) => document.uid !== documentState.uid)
            .find((document: IDocumentData) => document.slug === documentState.slug);

        if (documentNameExists || !DocumentStorageHelper.isDocumentNameValid(newDocumentName)) {
            setValidationError(true);
        } else {
            setValidationError(false);
            setDocumentData?.(documentState);

            window.history.replaceState(
                "",
                document.title,
                DocumentStorageHelper.getRelativeUrl(owner, documentState),
            );
        }
    }

    const updateDocumentName = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!documentData || !setDocumentData || !documentOwner || !documentsState) {
            return;
        }

        const newDocumentName = event.target.value;
        setDocumentName(newDocumentName);
        updateDocumentState(documentData, documentOwner, newDocumentName);
    };

    if (errorState) {
        return (
            <Error content={"Error loading component. Message: " + errorState}/>
        );
    }

    if (documentData && documentName) {
        const avgFontWidth = 8.5;
        const inputStyle = {
            width: `${documentName.length * avgFontWidth}px`,
        };

        return (
            <InputBase
                className="navBarDocumentEditor"
                value={documentName}
                inputProps={{"aria-label": "naked"}}
                onChange={updateDocumentName}
                placeholder={R.strings.editor.nav_bar.document_name_editor.placeholder_content}
                error={validationError}
                disabled={isAnonUser}
                style={inputStyle}
            />
        );
    } else {
        return null;
    }
}
