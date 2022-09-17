import Grid from "@material-ui/core/Grid";
import React, {useContext, useEffect} from "react";
import {DocumentStorageHelper} from "../../storage_engine/helpers/DocumentStorageHelper";
import DocumentContext from "../DocumentContext";
import "./Inspector.css";
import ActionPanel from "./panels/common/action_panel/ActionPanel";
import DocumentPanels from "./panels/document/DocumentPanels";
import SubjectPanels from "./panels/subject/SubjectPanels";

export default function Inspector() {
    const {documentState, selectedSubjectsUids} = useContext(DocumentContext);

    const [selectedElementsDataState, setSelectedElementsData] = React.useState();
    const [selectedRoutesDataState, setSelectedRoutesData] = React.useState();

    useEffect(() => {
        if (documentState && selectedSubjectsUids) {
            const {selectedElementsData, selectedRoutesData} =
                DocumentStorageHelper.getSelectedSubjectsData(documentState, selectedSubjectsUids);

            setSelectedElementsData(selectedElementsData);
            setSelectedRoutesData(selectedRoutesData);
        }
    }, [documentState, selectedSubjectsUids]);

    return (
        <Grid item xs={2} className="subjectInspector">
            <ActionPanel elements={selectedElementsDataState} routes={selectedRoutesDataState}/>
            <div className="subjectInspector-body">
                <SubjectPanels elements={selectedElementsDataState} routes={selectedRoutesDataState}/>
                <DocumentPanels/>
            </div>
        </Grid>
    );
}
