import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import RemoveIcon from "@material-ui/icons/Remove";
import React, {useCallback, useContext, useEffect, useRef} from "react";
import AuthContext from "../../../AuthContext";
import R from "../../resources/Namespace";
import {IDocumentData} from "../../storage_engine/models/FirebaseDataModels";
import DocumentContext from "../DocumentContext";
import {ZoomDirection} from "./controls/PhotonZoomControls";
import "./PhotonEngine.css";
import SceneManager from "./SceneManager";
import threeEntryPoint from "./ThreeEntryPoint";

export default function PhotonEngine() {
    // References
    const {currentUser} = useContext(AuthContext);
    const documentContext: any = useContext(DocumentContext);
    const threeRootElement: React.RefObject<HTMLDivElement> = useRef(null);
    const sceneManagerRef: React.MutableRefObject<SceneManager | null> = useRef(null);
    const sceneManager = sceneManagerRef.current;

    // Callbacks
    const performZoomIn = useCallback(() => {
        sceneManager?.photonZoomControls.zoom(ZoomDirection.In);
    }, [sceneManager]);
    const performZoomOut = useCallback(() => {
        sceneManager?.photonZoomControls.zoom(ZoomDirection.Out);
    }, [sceneManager]);
    const performZoomToFit = useCallback(() => {
        sceneManager?.photonZoomControls.panAndZoomToFit();
    }, [sceneManager]);

    const updateDocumentData = useCallback((updatedDocumentData: IDocumentData) => {
        documentContext.setDocumentState(updatedDocumentData);
    }, [documentContext]);
    const updateSelectedSubjectsUids = useCallback((selectedSubjectUids: string[]) => {
        documentContext.setSelectedSubjectsUids(selectedSubjectUids);
    }, [documentContext]);

    // Lifecycle
    useEffect(() => {
        if (currentUser) {
            sceneManagerRef.current = threeEntryPoint(
                threeRootElement.current,
                updateDocumentData,
                updateSelectedSubjectsUids,
                currentUser,
            );

            const {documentState} = documentContext;
            if (documentState) {
                sceneManagerRef.current.stateManager.loadDocument(documentState);
            }

            return () => {
                sceneManagerRef.current = null;
            };
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!sceneManager) {
            return;
        }

        const updatedDocumentData = documentContext.documentState;
        if (updatedDocumentData) {
            sceneManager.stateManager.updateDocument(updatedDocumentData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentContext.documentState]);

    useEffect(() => {
        if (!sceneManager) {
            return;
        }

        const updatedSelectedSubjectsData = documentContext.selectedSubjectsUids;
        if (updatedSelectedSubjectsData) {
            sceneManager.stateManager.unselectAllSubjects(true);
            sceneManager.stateManager.selectSubjectsByUids(updatedSelectedSubjectsData, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentContext.selectedSubjectsUids]);

    return (
        <>
            <div className="threeRootElement" ref={threeRootElement}/>
            <Box className="zoomControlsWrapper">
                <Box className="zoomControls">
                    <Tooltip title={R.strings.editor.zoom_controls.zoom_in} placement="left">
                        <Fab color="default" aria-label="add" className="zoomInBtn" size="small"
                            onClick={performZoomIn}
                        >
                            <AddIcon/>
                        </Fab>
                    </Tooltip>
                    <Tooltip title={R.strings.editor.zoom_controls.zoom_out} placement="left">
                        <Fab color="default" aria-label="remove" className="zoomOutBtn" size="small"
                            onClick={performZoomOut}
                        >
                            <RemoveIcon/>
                        </Fab>
                    </Tooltip>
                    <Tooltip title={R.strings.editor.zoom_controls.zoom_to_fit} placement="left">
                        <Fab color="default" aria-label="zoomToFit" className="zoomToFitBtn" size="small"
                            onClick={performZoomToFit}
                        >
                            <FullscreenIcon/>
                        </Fab>
                    </Tooltip>
                </Box>
            </Box>
        </>
    );
}
