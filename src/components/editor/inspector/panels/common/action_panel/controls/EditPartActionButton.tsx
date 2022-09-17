import EditIcon from "@material-ui/icons/Edit";
import React from "react";
import {withRouter} from "react-router-dom";
import R from "../../../../../../resources/Namespace";
import {DocumentStorage} from "../../../../../../storage_engine/DocumentStorage";
import {IElementData, IPartVersionData} from "../../../../../../storage_engine/models/FirebaseDataModels";
import {HotKeysHelper} from "../../../../../keyboard_shortcuts/helpers/HotKeysHelper";
import {useWindowKeyboardEvent} from "../../../../../keyboard_shortcuts/helpers/useWindowKeyboardEvent";
import "../../../../Inspector.css";
import ActionButton from "./ActionButton";

function EditPartActionButton(props: any) {
    const disabled = props.disabled as boolean;
    const selectedElementsData = props.elements as IElementData[];

    useWindowKeyboardEvent("keydown", (event) => {
        if (HotKeysHelper.isHotkey(R.keyCommands.edit_part.keys, event as KeyboardEvent)) {
            event.preventDefault();
            handleEditPartBtn();
        }
    }, []);

    let partVersionData: IPartVersionData;
    if (selectedElementsData?.length > 0) {
        partVersionData = selectedElementsData[0]?.part_version_data_cache;
    }

    function handleEditPartBtn() {
        if (partVersionData && partVersionData.document_import_uid) {
            new DocumentStorage()
                .getDocumentUrlByUid(partVersionData.document_import_uid, false)
                .then((documentUrl) => {
                    window.open(documentUrl, "_blank");
                });
        }
    }

    function isDisabled() {
        if (disabled || !partVersionData?.document_import_uid) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <ActionButton tooltipContent={R.strings.inspector.action_panel.edit}
                      disabled={isDisabled()} onClick={handleEditPartBtn} iconComponent={<EditIcon/>}/>
    );
}

export default withRouter(EditPartActionButton);
