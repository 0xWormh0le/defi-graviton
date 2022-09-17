import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React, {useContext} from "react";
import {withRouter} from "react-router-dom";
import AuthContext from "../../../../../../../AuthContext";
import R from "../../../../../../resources/Namespace";
import {DocumentStorageHelper} from "../../../../../../storage_engine/helpers/DocumentStorageHelper";
import {PartStorageHelper} from "../../../../../../storage_engine/helpers/PartStorageHelper";
import {IElementData, IPartVersionData, IVector2} from "../../../../../../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../../../../../../storage_engine/PartStorage";
import DocumentContext from "../../../../../DocumentContext";
import {HotKeysHelper} from "../../../../../keyboard_shortcuts/helpers/HotKeysHelper";
import {useWindowKeyboardEvent} from "../../../../../keyboard_shortcuts/helpers/useWindowKeyboardEvent";
import "../../../../Inspector.css";
import ActionButton from "./ActionButton";

function CreatePartActionButton(props: any) {
    const disabled = props.disabled as boolean;
    const selectedElementsData = props.elements as IElementData[];

    const {currentUser} = useContext(AuthContext);
    const {documentState, setDocumentState, setSelectedSubjectsUids} = useContext(DocumentContext);

    useWindowKeyboardEvent("keydown", (event) => {
        if (HotKeysHelper.isHotkey(R.keyCommands.convert_to_part.keys, event as KeyboardEvent)) {
            event.preventDefault();
            handleConvertToPartBtn();
        }
    }, []);

    function handleConvertToPartBtn() {
        if (currentUser && documentState && selectedElementsData) {
            const selectedElementsPosition = DocumentStorageHelper.getElementsPosition(selectedElementsData);

            new PartStorage()
                .createPartFromSubjects(documentState, selectedElementsData, currentUser)
                .then((result) => {
                    if (result === undefined) {
                        throw new Error("Result is undefined");
                    }
                    const partVersion = result.partVersion;
                    const connections = result.connections;

                    DocumentStorageHelper.deleteElements(documentState, selectedElementsData);
                    // DocumentStorageHelper.cleanupDeadRoutes(documentState);

                    const newElement = createElementFromNewPart(partVersion, selectedElementsPosition);

                    if (selectedElementsData.length === 1) {
                        newElement.diagram_position.flip = selectedElementsData[0].diagram_position.flip;
                        newElement.diagram_position.orientation = selectedElementsData[0].diagram_position.orientation;
                    }

                    DocumentStorageHelper.addElement(documentState, newElement);
                    // todo: connections object doesn't always include the
                    //  right data and therefor reconnecting the new element fails
                    DocumentStorageHelper.restoreNewElementConnections(
                        documentState,
                        newElement,
                        connections,
                        currentUser,
                    );

                    setDocumentState?.(documentState);
                    setSelectedSubjectsUids?.([newElement.uid]);
                });
        }
    }

    function createElementFromNewPart(partVersionToBeAdded: IPartVersionData, dropPosition: IVector2) {
        const position = PartStorageHelper.createElementPosition(true, dropPosition.x, dropPosition.y);

        return DocumentStorageHelper.createNewElementData(partVersionToBeAdded, position);
    }

    return (
        <ActionButton tooltipContent={R.strings.inspector.action_panel.convert}
                      disabled={disabled} onClick={handleConvertToPartBtn} iconComponent={<ExitToAppIcon/>}/>
    );
}

export default withRouter(CreatePartActionButton);
