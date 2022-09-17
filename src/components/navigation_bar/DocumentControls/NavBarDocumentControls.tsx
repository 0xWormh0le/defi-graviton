import React, {useContext} from "react";
import DocumentContext from "../../editor/DocumentContext";
import DocumentNameEditor from "./DocumentNameEditor/DocumentNameEditor";
import DocumentSyncStateView from "./DocumentSyncState/DocumentSyncStateView";
import DuplicateDocument from "./DuplicateDocument/DuplicateDocument";

export default function NavBarDocumentControls() {
    const context = useContext(DocumentContext);
    const documentData = context.documentState;

    if (documentData) {
        return (
            <>
                <DocumentNameEditor/>
                <DuplicateDocument/>
                <DocumentSyncStateView/>
            </>
        );
    } else {
        return null;
    }
}
