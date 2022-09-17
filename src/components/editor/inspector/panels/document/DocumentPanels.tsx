import React, {useContext} from "react";
import DocumentContext from "../../../DocumentContext";
import DebugPanel from "../common/debug_panel/DebugPanel";
import DocumentInfoPanel from "./info_panel/DocumentInfoPanel";
import PartPropertiesPanel from "./properties_panel/PartPropertiesPanel";

export default function DocumentPanels() {
    const context = useContext(DocumentContext);
    const selectedSubjectsUids = context.selectedSubjectsUids;

    const [documentInfoPanelExpansionState, setDocumentInfoPanelExpansionState] = React.useState(false);
    const [partPropertiesExpansionState, setPartPropertiesPanelExpansionState] = React.useState(false);
    const [debugPanelExpansionState, setDebugPanelExpansionState] = React.useState(false);

    if (selectedSubjectsUids?.length === 0) {
        return (
            <>
                <DocumentInfoPanel panelExpanded={documentInfoPanelExpansionState}
                                   onExpansionChange={setDocumentInfoPanelExpansionState}/>
                <PartPropertiesPanel panelExpanded={partPropertiesExpansionState}
                                     onExpansionChange={setPartPropertiesPanelExpansionState}/>
                <DebugPanel panelExpanded={debugPanelExpansionState}
                            onExpansionChange={setDebugPanelExpansionState}/>
            </>
        );
    } else {
        return null;
    }
}
