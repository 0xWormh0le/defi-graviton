import React from "react";
import {IElementData, IRouteData} from "../../../../storage_engine/models/FirebaseDataModels";
import DebugPanel from "../common/debug_panel/DebugPanel";
import InfoPanel from "./info_panel/InfoPanel";
import LayoutPanel from "./layout_panel/LayoutPanel";
import PartPanel from "./part_panel/PartPanel";
import PropertiesPanel from "./properties_panel/PropertiesPanel";

export default function SubjectPanels(props: any) {
    const selectedRoutesData = props.routes as IRouteData[];
    const selectedElementsData = props.elements as IElementData[];

    const [layoutPanelExpansionState, setLayoutPanelExpansionState] = React.useState(false);
    const [infoPanelExpansionState, setInfoPanelExpansionState] = React.useState(false);
    const [partPanelExpansionState, setPartPanelExpansionState] = React.useState(false);
    const [propertiesExpansionState, setPropertiesPanelExpansionState] = React.useState(false);
    const [debugPanelExpansionState, setDebugPanelExpansionState] = React.useState(false);

    if (selectedElementsData?.length > 0) {
        return (
            <>
                <LayoutPanel elements={selectedElementsData} routes={selectedRoutesData}
                             panelExpanded={layoutPanelExpansionState}
                             onExpansionChange={setLayoutPanelExpansionState}/>
                <InfoPanel elements={selectedElementsData} routes={selectedRoutesData}
                           panelExpanded={infoPanelExpansionState}
                           onExpansionChange={setInfoPanelExpansionState}/>
                <PartPanel elements={selectedElementsData} routes={selectedRoutesData}
                           panelExpanded={partPanelExpansionState} onExpansionChange={setPartPanelExpansionState}/>
                <PropertiesPanel elements={selectedElementsData} routes={selectedRoutesData}
                                 panelExpanded={propertiesExpansionState}
                                 onExpansionChange={setPropertiesPanelExpansionState}/>
                <DebugPanel elements={selectedElementsData} routes={selectedRoutesData}
                            panelExpanded={debugPanelExpansionState} onExpansionChange={setDebugPanelExpansionState}/>
            </>
        );
    } else {
        return null;
    }
}
