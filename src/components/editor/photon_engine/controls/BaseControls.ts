import {debounce} from "lodash";
import {Group, Intersection, Line, Mesh, Object3D, OrthographicCamera, Vector3, WebGLRenderer} from "three";
import BRANCH_POINT_UID from "../../../../constants/branchPointUid";
import R from "../../../resources/Namespace";
import { IElementData } from "../../../storage_engine/models/FirebaseDataModels";
import BaseSubject, {SubjectType} from "../scene_subjects/BaseSubject";
import ModuleSubject from "../scene_subjects/ModuleSubject";
import StandardSymbolSubject from "../scene_subjects/StandardSymbolSubject";
import SceneManager from "../SceneManager";
import SceneStateManager from "../SceneStateManager";

export enum MouseButton {
    Main,
    Auxiliary,
    Secondary,
    Fourth,
    Fifth,
}

export enum SubjectFilter {
    Dragable,
    Selectable,
}

class BaseControls {

    private static getMaxSubjectZLevel() {
        const maxZLevel = Math.max(...(Object.values(R.layout.z_order) as number[]));
        return maxZLevel;
    }

    public enabled: boolean = true;

    public throttledStoreViewerState = debounce((
        navigationControlsTarget: Vector3) => this.storeViewerState(navigationControlsTarget),
        R.behaviors.zoom_controls.writeDelay,
        {maxWait: R.behaviors.zoom_controls.writeMaxWait});
    protected sceneManager: SceneManager;
    protected stateManager: SceneStateManager;
    protected camera: OrthographicCamera;
    protected renderer: WebGLRenderer;
    protected intersected: Mesh | null = null;
    protected readonly sceneSubjects: BaseSubject[];
    protected intersects: Intersection[] = [];

    constructor(sceneManager: SceneManager) {
        this.camera = sceneManager.camera;
        this.renderer = sceneManager.renderer;
        this.sceneSubjects = sceneManager.sceneSubjects;
        this.sceneManager = sceneManager;
        this.stateManager = sceneManager.stateManager;
    }

    public onMouseMove(event: MouseEvent) {
        event.preventDefault();
    }

    public onMouseDown(event: MouseEvent) {
        event.preventDefault();
    }

    public onMouseUp(event: MouseEvent) {
        event.preventDefault();
    }

    public getCameraZPosition() {
        const clipppingBuffer = 3;
        return BaseControls.getMaxSubjectZLevel() + clipppingBuffer;
    }

    protected updateTerminalLabelVisibility(intersected: Object3D | null) {
        let elementUid: string = "";
        if (intersected) {
            if (intersected instanceof Mesh) {
                return;
            }
            const subject = this.stateManager.findSubjectByObject3dUuid(intersected.uuid);
            if (subject) {
                elementUid = subject.subjectUid;
            } else {
                return;
            }
        }

        this.stateManager.getSubjectsByType(SubjectType.Element).forEach((genericElementSubject) => {
            let elementSubject;

            if (genericElementSubject.constructor.name === "StandardSymbolSubject") {
                elementSubject = genericElementSubject as StandardSymbolSubject;
            } else {
                elementSubject = genericElementSubject as ModuleSubject;
            }

            if (elementUid === elementSubject.subjectUid) {
                elementSubject.showTerminal(true);
            } else {
                elementSubject.showTerminal(false);
            }
        });
    }

    protected getLocalIntersects(localIntersectMap: Object3D[], recursive: boolean = false) {
        try {
            localIntersectMap = localIntersectMap.filter((localIntersect: Object3D) => localIntersect);
            const intersectedObjects = this.sceneManager.raycaster.intersectObjects(localIntersectMap, recursive);
            return intersectedObjects;
        } catch (error) {
            return [];
        }
    }

    protected updateIntersectingSceneSubjects(filter: SubjectFilter) {
        // ordered by distance (closest first)
        let intersectableSubjectsMap;
        if (filter === SubjectFilter.Dragable) {
            intersectableSubjectsMap = this.getDragableSceneSubjects();
        } else if (filter === SubjectFilter.Selectable) {
            intersectableSubjectsMap = this.getSelectableSceneSubjects();
        }
        if (!intersectableSubjectsMap) {
            return;
        }
        this.intersects = this.getLocalIntersects(Array.from(intersectableSubjectsMap.keys()));

    }

    protected updateIntersected() {
        if (this.intersects.length === 0) {
            this.intersected = null;
            return;
        }

        this.intersected = this.intersects[0].object as Mesh;
        if (this.intersected.type !== "Mesh") {
            const possibleMesh = this.intersects[this.intersects.length - 1].object as Mesh;
            if (possibleMesh.type === "Mesh") {
                const elementData =
                 this.stateManager.findSubjectByObject3dUuid(possibleMesh.uuid)?.getSubjectData() as IElementData;
                if (elementData.part_uid === BRANCH_POINT_UID) {
                    this.intersected = possibleMesh;
                }
            }
        }
    }

    protected storeViewerState(navigationControlsTarget: Vector3) {
        this.stateManager.setOrUpdateDocumentProp(
            "zoom",
            this.camera.zoom,
            "viewer_state",
        );
        this.stateManager.setOrUpdateDocumentProp(
            "camera_position",
            {x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z},
            "viewer_state",
        );
        this.stateManager.setOrUpdateDocumentProp(
            "navigation_controls_target",
            {x: navigationControlsTarget.x, y: navigationControlsTarget.y, z: navigationControlsTarget.z},
            "viewer_state",
        );
    }

    protected isMultiSelectKeyCommand(event: MouseEvent | KeyboardEvent) {
        return event.metaKey || event.ctrlKey || event.shiftKey;
    }

    private getDragableSceneSubjects() {
        const dragableSceneSubjects = new Map<Mesh | Object3D | Line | Group, BaseSubject>();

        if (this.sceneSubjects) {
            this.sceneSubjects.forEach((subject) => {
                if (subject.isDragable) {
                    dragableSceneSubjects.set(subject.clickTarget as Object3D, subject);
                }
            });
        }
        return dragableSceneSubjects;
    }

    private getSelectableSceneSubjects() {
        const selectableSceneSubjects = new Map<Mesh | Object3D | Line | Group, BaseSubject>();

        if (this.sceneSubjects) {
            this.sceneSubjects.forEach((subject) => {
                if (subject.isSelectable) {
                    selectableSceneSubjects.set(subject.clickTarget as Object3D, subject);
                }
            });
        }

        return selectableSceneSubjects;
    }
}

export default BaseControls;
