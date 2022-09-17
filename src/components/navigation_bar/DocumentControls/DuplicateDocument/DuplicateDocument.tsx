import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import React, {useContext} from "react";
import AuthContext from "../../../../AuthContext";
import DocumentContext from "../../../editor/DocumentContext";
import {DocumentStorage} from "../../../storage_engine/DocumentStorage";
import {DocumentStorageHelper} from "../../../storage_engine/helpers/DocumentStorageHelper";

export default function DuplicateDocument() {
    const context = useContext(DocumentContext);
    const {currentUser} = useContext(AuthContext);
    const documentData = context.documentState;

    function handleOnClick() {
        if (!currentUser || !documentData) {
            return;
        }

        const newDocument = DocumentStorageHelper.duplicateDocument(currentUser, documentData);

        new DocumentStorage().setDocument(newDocument).then(() => {
            const documentUrl = DocumentStorageHelper.getAbsoluteUrl(currentUser, newDocument);

            window.open(documentUrl, "_blank");
        });
    }

    if (documentData) {
        return (
            <Tooltip title={"Duplicate Document"}>
                <IconButton onClick={handleOnClick} size="medium">
                    <FileCopyIcon fontSize="small"/>
                </IconButton>
            </Tooltip>
        );
    } else {
        return null;
    }
}
