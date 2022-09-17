import React, {useContext, useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import AuthContext from "../../AuthContext";
import {withAuthorization} from "../authentication/WithAuthorization";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {DocumentStorage} from "../storage_engine/DocumentStorage";
import {DocumentStorageHelper} from "../storage_engine/helpers/DocumentStorageHelper";
import {IUserData} from "../storage_engine/models/FirebaseDataModels";
import Error from "../utils/Error";
import LargeSpinner from "../utils/LargeSpinner";

export function CreateDocumentComponent() {
    const {currentUser} = useContext(AuthContext);

    const [loading, setLoading] = React.useState(true);
    const [stateDocument, setDocument] = useState();

    useEffect(() => {
        if (currentUser && !firebaseApp.auth().currentUser?.isAnonymous && !stateDocument) {
            createNewDocument(currentUser);
        }

        function createNewDocument(user: IUserData) {
            const newDocument = DocumentStorageHelper.createNewDocumentData(user);

            setDocument(newDocument);
            setLoading(false);

            new DocumentStorage().setDocument(newDocument);
        }
    }, [currentUser, stateDocument]);

    if (!currentUser) {
        return (
            <Error content={"User does not exist"}/>
        );
    } else if (firebaseApp.auth().currentUser?.isAnonymous) {
        return (
            <Error content={"Error creating document. Anonymous users can't created documents."}/>
        );
    } else if (loading) {
        return (
            <LargeSpinner content={"Creating Document..."}/>
        );
    } else {
        return (
            <Redirect to={DocumentStorageHelper.getRelativeUrl(currentUser, stateDocument)}/>
        );
    }
}

const authCondition = (firebaseAuthUser: any) => !!firebaseAuthUser;

export const CreateDocument = withAuthorization(authCondition)(CreateDocumentComponent);
