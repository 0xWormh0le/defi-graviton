import {Group, Line, Mesh, Object3D, Vector3} from "three";
import R from "../../../resources/Namespace";
import {IElementData} from "../../../storage_engine/models/FirebaseDataModels";
import BaseSubject, {SubjectType} from "../scene_subjects/BaseSubject";
import SegmentSubject from "../scene_subjects/SegmentSubject";
import SceneManager from "../SceneManager";
import BaseControls, {MouseButton, SubjectFilter} from "./BaseControls";
import PhotonNavigationControls from "./PhotonNavigationControls";

class PhotonDragControls extends BaseControls {

    private static didElementPositionChange(subjectData: IElementData, compareToMesh: Object3D) {
        return subjectData.diagram_position.x !== compareToMesh.position.x
            || subjectData.diagram_position.y !== compareToMesh.position.y;
    }

    public photonNavigationControls: PhotonNavigationControls;
    public selectedMasterSubjectMesh: Mesh | null = null;
    public skipRouteControlMouseUpEvent = false;
    private dragging: boolean = false;
    private lastDragMousePosition: Vector3 | undefined;

    constructor(sceneManager: SceneManager) {
        super(sceneManager);
        this.photonNavigationControls = sceneManager.photonNavigationControls;
    }

    public onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        if (!this.enabled) {
            return;
        }

        this.updateIntersectingSceneSubjects(SubjectFilter.Dragable);

        if (!this.dragSubjects(event)) {
            this.updateIntersected();
        }
    }

    public onMouseDown(event: MouseEvent): boolean {
        super.onMouseDown(event);
        if (!this.enabled) {
            return false;
        }

        if (event.button !== MouseButton.Main) {
            return false;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return false;
        }
        if (!this.intersected) {
            return false;
        }

        this.lastDragMousePosition = this.sceneManager.getSceneMousePosition(event.clientX, event.clientY);

        return this.startDraggingSubjects();
    }

    public onMouseUp(event: MouseEvent): boolean {
        super.onMouseUp(event);
        if (!this.enabled) {
            return false;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return false;
        }
        if (event.button !== MouseButton.Main) {
            return false;
        }

        return this.stopDraggingSubjects();
    }

    public update(delta: number) {

    }

    private startDraggingSubjects() {
        if (!this.dragging) {
            this.photonNavigationControls.controls.enabled = false;
            this.selectedMasterSubjectMesh = this.intersected;
            this.renderer.domElement.style.cursor = "move";
            this.dragging = true;
            return true;
        }
        return false;
    }

    private dragSubjects(event: MouseEvent) {
        if (this.selectedMasterSubjectMesh) {
            const worldMousePosition = this.sceneManager.getSceneMousePosition(event.clientX, event.clientY);

            const selectedMasterSubject =
                this.sceneManager.stateManager.findSubjectByObject3d(this.selectedMasterSubjectMesh);

            if (!selectedMasterSubject) {
                return console.error("Could not find subject for the given 3D mesh");
            }

            if (this.stateManager.getSelectedSubjects().length > 0 &&
                this.stateManager.getSelectedSubjects().find((subjectUid) =>
                    subjectUid.subjectUid === selectedMasterSubject.subjectUid)) {

                this.dragSelectedSubjects(worldMousePosition);

            } else {
                if (selectedMasterSubject && selectedMasterSubject.subjectType === SubjectType.RouteSegment) {
                    this.dragUnselectedSegment(selectedMasterSubject as SegmentSubject, worldMousePosition);
                } else {
                    this.dragUnselectedSubject(worldMousePosition);
                }
            }
            this.skipRouteControlMouseUpEvent = true;
            return true;
        } else {
            return false;
        }
    }

    private dragUnselectedSegment(segment: SegmentSubject, worldMousePosition: Vector3) {
        segment.updatePosition(worldMousePosition);
    }

    private dragUnselectedSubject(worldMousePosition: Vector3) {
        if (!this.selectedMasterSubjectMesh) {
            return;
        }

        if (this.selectedMasterSubjectMesh.parent) {
            this.moveSubjectMesh(worldMousePosition, this.selectedMasterSubjectMesh.parent);
            this.lastDragMousePosition = worldMousePosition;
        }
    }

    private moveSubjectMesh(worldMousePosition: Vector3, subjectMesh: Object3D | Mesh | Line | Group) {
        const deltaX = worldMousePosition.x - this.lastDragMousePosition!.x;
        const deltaY = worldMousePosition.y - this.lastDragMousePosition!.y;

        const posX = subjectMesh.position.x + deltaX;
        const posY = subjectMesh.position.y + deltaY;

        subjectMesh.position.copy(new Vector3(posX, posY, R.layout.z_order.dragging_element));
    }

    private dragSelectedSubjects(worldMousePosition: Vector3) {
        if (!this.selectedMasterSubjectMesh) {
            return;
        }

        const deltaX = worldMousePosition.x - this.lastDragMousePosition!.x;
        const deltaY = worldMousePosition.y - this.lastDragMousePosition!.y;

        this.stateManager.getSelectedSubjects().forEach((selectedSubject) => {
            if (selectedSubject.sceneObject && selectedSubject.subjectType === SubjectType.RouteSegment) {
                const segmentSubject = selectedSubject as SegmentSubject;
                const segmentPosition = segmentSubject.getPosition();
                const isHorizontal = segmentSubject.isHorizontal;
                if (isHorizontal) {
                    segmentSubject
                        .updatePosition(new Vector3(segmentPosition.x, segmentPosition.y + deltaY, segmentPosition.z));
                } else {
                    segmentSubject
                        .updatePosition(new Vector3(segmentPosition.x + deltaX, segmentPosition.y, segmentPosition.z));
                }
            }
            if (selectedSubject.sceneObject && selectedSubject.subjectType === SubjectType.Element) {
                this.moveSubjectMesh(worldMousePosition, selectedSubject.sceneObject);
            }
        });
        this.lastDragMousePosition = worldMousePosition;
    }

    private stopDraggingSubjects(): boolean {
        this.photonNavigationControls.controls.enabled = true;
        this.renderer.domElement.style.cursor = "pointer";

        if (this.selectedMasterSubjectMesh && this.dragging) {
            this.didDropSubject();
            this.dragging = false;
            return true;
        }

        return false;
    }

    private didDropSubject() {
        let updatedPosition = false;
        let updatedSubject: BaseSubject | undefined;

        if (this.selectedMasterSubjectMesh) {
            if (this.stateManager.getSelectedSubjects().length > 0) {
                this.stateManager.getSelectedSubjects().forEach((selectedSubject) => {
                    updatedPosition = this.dropSelectedSubjects(selectedSubject, updatedPosition);
                    updatedSubject = selectedSubject;
                    if (!updatedPosition) {
                        const dropUnselected = this.dropUnselectedSubject(updatedPosition);
                        updatedPosition = dropUnselected.updatedPosition;
                        updatedSubject = dropUnselected.updatedSubject;
                    }
                });
            } else {
                const dropUnselected = this.dropUnselectedSubject(updatedPosition);
                updatedPosition = dropUnselected?.updatedPosition || false;
                updatedSubject = dropUnselected?.updatedSubject;
            }
        }

        this.selectedMasterSubjectMesh = null;

        if (updatedSubject?.subjectType === SubjectType.Route ||
            updatedSubject?.subjectType === SubjectType.RouteSegment) {
            updatedPosition = true;
        }

        if (updatedPosition) {
            this.stateManager.updateDocumentData(true);
        }
    }

    private dropSelectedSubjects(selectedSubject: BaseSubject, updatedPosition: boolean) {
        const selectedSubjectData = selectedSubject.getSubjectData() as IElementData;

        if (selectedSubject.sceneObject) {
            if (selectedSubject.subjectType === SubjectType.Route) {
                return updatedPosition;

            } else if (selectedSubject.subjectType === SubjectType.Element &&
                PhotonDragControls.didElementPositionChange(selectedSubjectData, selectedSubject.sceneObject)) {
                selectedSubjectData.diagram_position.x = selectedSubject.sceneObject.position.x;
                selectedSubjectData.diagram_position.y = selectedSubject.sceneObject.position.y;

                const selectedSubjectIndex =
                    this.stateManager.findSubjectIndexByUid(selectedSubject.subjectUid);

                const subject = this.sceneManager.sceneSubjects[selectedSubjectIndex];
                if (subject) {
                    subject.updateFromData(selectedSubjectData);
                    updatedPosition = true;
                    this.sceneManager.photonSelectControls.skipSelectControlMouseUpEvent = true;
                }

            }
        }

        return updatedPosition;
    }

    private dropUnselectedSubject(updatedPosition: boolean) {
        if (!this.selectedMasterSubjectMesh) {
            return {updatedPosition: false, updatedSubject: undefined};
        }

        const selectedSubjectIndex = this.stateManager.findSubjectIndexByObject3dUuid(
            this.selectedMasterSubjectMesh.uuid,
        );
        const subject = this.sceneManager.sceneSubjects[selectedSubjectIndex];

        const sceneObject = this.selectedMasterSubjectMesh.parent as Object3D;

        if (subject) {
            const selectedSubjectData = subject.getSubjectData() as IElementData;

            if (selectedSubjectData && subject.subjectType === SubjectType.Element &&
                PhotonDragControls.didElementPositionChange(selectedSubjectData, sceneObject)) {

                if (this.selectedMasterSubjectMesh.parent) {
                    selectedSubjectData.diagram_position.x = this.selectedMasterSubjectMesh.parent.position.x;
                    selectedSubjectData.diagram_position.y = this.selectedMasterSubjectMesh.parent.position.y;
                    subject.updateFromData(selectedSubjectData);
                    updatedPosition = true;
                    this.sceneManager.photonSelectControls.skipSelectControlMouseUpEvent = true;
                }

            }
            return {updatedPosition, updatedSubject: subject};
        }

        return {updatedPosition: false, updatedSubject: undefined};
    }
}

export default PhotonDragControls;
