import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import FlipIcon from "@material-ui/icons/Flip";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import React, {useContext} from "react";
import R from "../../../../../resources/Namespace";
import {DocumentStorageHelper} from "../../../../../storage_engine/helpers/DocumentStorageHelper";
import {IElementData, IRouteData} from "../../../../../storage_engine/models/FirebaseDataModels";
import EditorContext from "../../../../DocumentContext";
import {HotKeysHelper} from "../../../../keyboard_shortcuts/helpers/HotKeysHelper";
import {useWindowKeyboardEvent} from "../../../../keyboard_shortcuts/helpers/useWindowKeyboardEvent";
import ActionButton from "./controls/ActionButton";
import CreatePartPanel from "./controls/CreatePartActionButton";
import EditPartActionButton from "./controls/EditPartActionButton";

export default function ActionPanel(props: any) {
    const selectedRoutesData = props.routes as IRouteData[];
    const selectedElementsData = props.elements as IElementData[];

    const context = useContext(EditorContext);
    const documentData = context.documentState;
    const setDocumentData = context.setDocumentState;

    useWindowKeyboardEvent("keydown", (event) => {
        if (HotKeysHelper.isHotkey(R.keyCommands.flip.keys, event as KeyboardEvent)) {
            event.preventDefault();
            handleFlip();
        }
    }, []);

    function handleRotation() {
        if (documentData && setDocumentData) {
            DocumentStorageHelper.rotateElement(documentData, selectedElementsData);
            setDocumentData(documentData);
        }
    }

    function handleFlip() {
        if (documentData && setDocumentData) {
            DocumentStorageHelper.flipElements(documentData, selectedElementsData);
            setDocumentData(documentData);
        }
    }

    function handleDelete() {
        if (documentData && setDocumentData) {
            DocumentStorageHelper.deleteRoutes(documentData, selectedRoutesData);
            DocumentStorageHelper.deleteElements(documentData, selectedElementsData);
            setDocumentData(documentData);
        }
    }

    const areSubjectActionsDisabled = !selectedElementsData || selectedElementsData.length === 0;

    return (
        <Grid container className="inspectorActionPanel">
            <ActionButton
                tooltipContent={R.strings.inspector.action_panel.rotate}
                disabled={areSubjectActionsDisabled}
                onClick={handleRotation}
                iconComponent={<RotateRightIcon/>}
            />
            <ActionButton
                tooltipContent={R.strings.inspector.action_panel.flip}
                disabled={areSubjectActionsDisabled}
                onClick={handleFlip}
                iconComponent={<FlipIcon/>}
            />
            <CreatePartPanel
                elements={selectedElementsData}
                routes={selectedRoutesData}
                disabled={areSubjectActionsDisabled}
            />
            <EditPartActionButton
                elements={selectedElementsData}
                routes={selectedRoutesData}
                disabled={areSubjectActionsDisabled}
            />
            <ActionButton
                tooltipContent={R.strings.inspector.action_panel.delete}
                disabled={areSubjectActionsDisabled}
                onClick={handleDelete}
                iconComponent={<DeleteIcon/>}
            />
        </Grid>
    );
}
