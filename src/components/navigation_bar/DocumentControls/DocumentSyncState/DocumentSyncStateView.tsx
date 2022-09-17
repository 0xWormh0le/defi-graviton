import Typography from "@material-ui/core/Typography";
import React, {useContext, useEffect, useState} from "react";
import DocumentContext, {DocumentSyncStates} from "../../../editor/DocumentContext";

export default function DocumentSyncStateView() {
    const {documentSyncState} = useContext(DocumentContext);

    const [statusMessage, setStatusMessage] = useState();

    useEffect(() => {
        if (!documentSyncState) {
            return;
        }

        if (documentSyncState.state === DocumentSyncStates.synced) {
            setStatusMessage("All changes saved.");
        } else if (documentSyncState.state === DocumentSyncStates.syncing) {
            setStatusMessage("Saving...");
        } else if (documentSyncState.state === DocumentSyncStates.offline) {
            setStatusMessage("Offline mode. Changes will be saved when you are back online.");
        } else if (documentSyncState.state === DocumentSyncStates.error) {
            setStatusMessage("Error saving document!");
        }

        const timer = setTimeout(() => setStatusMessage(""), 3000);

        return () => {
            clearTimeout(timer);
        };

    }, [documentSyncState]);

    if (statusMessage) {
        return (
            <Typography variant="body2" className="navBarSyncStatus" color="textSecondary">
                {statusMessage}
            </Typography>
        );
    } else {
        return null;
    }
}
