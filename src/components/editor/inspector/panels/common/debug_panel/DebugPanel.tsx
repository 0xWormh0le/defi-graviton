import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import * as path from "path";
import React, {useContext} from "react";
import {IElementData} from "../../../../../storage_engine/models/FirebaseDataModels";
import DocumentContext from "../../../../DocumentContext";
import ButtonInput from "../controls/ButtonInput";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        root: {
            "& .MuiTextField-root": {
                margin: theme.spacing(1),
                width: 125,
            },
        },
    }),
);

export default function DebugPanel(props: any) {
    const classes = useStyles();
    const selectedElementsData = props.elements;
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(DocumentContext);
    const documentData = context.documentState;
    const documentOwnerData = context.documentOwner;

    function getFirebaseUrl() {
        const firebaseConsoleBaseUrl = process.env.REACT_APP_FIREBASE_CONSOLE_BASE_URL;
        const firebaseProjectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;

        if (firebaseConsoleBaseUrl && firebaseProjectId) {
            return new URL(path.join(firebaseProjectId, "database/firestore/data~2F"), firebaseConsoleBaseUrl);
        }
        return "";
    }

    function buildFirebaseConsolePartUrl() {
        const partsNamespace = process.env.REACT_APP_FIREBASE_PARTS_NAMESPACE;
        const element = selectedElementsData[0];

        if (partsNamespace && element) {
            const url = getFirebaseUrl()
                + partsNamespace + "~2F"
                + element.part_uid;

            window.open(url, "_blank");
        }
    }

    function buildFirebaseConsolePartVersionUrl() {
        const partsNamespace = process.env.REACT_APP_FIREBASE_PARTS_NAMESPACE;
        const partVersionsNamespace = process.env.REACT_APP_FIREBASE_PART_VERSIONS_NAMESPACE;
        const element = selectedElementsData[0];

        if (partsNamespace && partVersionsNamespace && element) {
            const url = getFirebaseUrl()
                + partsNamespace + "~2F"
                + element.part_uid + "~2F"
                + partVersionsNamespace + "~2F"
                + element.part_version_data_cache.version;

            window.open(url, "_blank");
        }
    }

    function buildFirebaseConsoleDocumentUrl() {
        const documentsNamespace = process.env.REACT_APP_FIREBASE_DOCUMENTS_NAMESPACE;

        if (documentsNamespace && documentData) {
            const url = getFirebaseUrl()
                + documentsNamespace + "~2F"
                + documentData.uid;

            window.open(url, "_blank");
        }
    }

    function buildFirebaseConsolePartDocumentUrl() {
        const partsNamespace = process.env.REACT_APP_FIREBASE_PARTS_NAMESPACE;

        if (partsNamespace && documentData) {
            const url = getFirebaseUrl()
                + partsNamespace + "~2F"
                + documentData.belongs_to_part_uid;

            window.open(url, "_blank");
        }
    }

    function buildFirebaseConsoleDocumentOwnerUrl() {
        const usersNamespace = process.env.REACT_APP_FIREBASE_USERS_NAMESPACE;

        if (usersNamespace && documentOwnerData) {
            const url = getFirebaseUrl()
                + usersNamespace + "~2F"
                + documentOwnerData.handle;

            window.open(url, "_blank");
        }
    }

    function buildFirebaseConsoleElementUrl() {
        const documentsNamespace = process.env.REACT_APP_FIREBASE_DOCUMENTS_NAMESPACE;
        const documentElementCollectionNamespace =
            process.env.REACT_APP_FIREBASE_DOCUMENTS_ELEMETS_COLLECTION_NAMESPACE;
        const element = selectedElementsData[0];

        if (documentsNamespace && documentData && element) {
            const url = getFirebaseUrl()
                + documentsNamespace + "~2F"
                + documentData.uid + "~2F"
                + documentElementCollectionNamespace + "~2F"
                + element.uid;

            window.open(url, "_blank");
        }
    }

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    function getDocumentFeatures() {
        if (!selectedElementsData) {
            return (
                <div>
                    <ButtonInput label="Open Document" onClick={buildFirebaseConsoleDocumentUrl}/>
                    {partDocumentButton()}
                    <ButtonInput label="Open Document Owner" onClick={buildFirebaseConsoleDocumentOwnerUrl}/>
                </div>
            );
        }
    }

    function partDocumentButton() {
        if (documentData?.belongs_to_part_uid) {
            return (
                <ButtonInput label="Open Part Document" onClick={buildFirebaseConsolePartDocumentUrl}/>
            );
        }
    }

    function getSubjectFeatures() {
        if (selectedElementsData?.length > 0) {
            return (
                <div>
                    {selectedElementsData.map((element: IElementData) => (
                        <div key={element.uid}>
                            <ButtonInput label="Open Part" onClick={buildFirebaseConsolePartUrl}/>
                            <ButtonInput label="Open Part Version" onClick={buildFirebaseConsolePartVersionUrl}/>
                            <ButtonInput label="Open Element" onClick={buildFirebaseConsoleElementUrl}/>
                        </div>
                    ))}
                </div>
            );
        }
    }

    if (process.env.NODE_ENV === "development") {
        return (
            <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography className={classes.heading}>[Debugger]</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {getDocumentFeatures()}
                    {getSubjectFeatures()}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    } else {
        return null;
    }
}
