import {Mesh, Vector2} from "three";
import {Line} from "three";
import R from "../../../resources/Namespace";
import {Clipboard, IClipboardDataContent} from "../../../storage_engine/Clipboard";
import {DocumentStorageHelper} from "../../../storage_engine/helpers/DocumentStorageHelper";
import {PartStorageHelper} from "../../../storage_engine/helpers/PartStorageHelper";
import {IElementData, IRouteData, IVector2} from "../../../storage_engine/models/FirebaseDataModels";
import {HotKeysHelper} from "../../keyboard_shortcuts/helpers/HotKeysHelper";
import {getRotationStep} from "../helpers/PhotonEngineHelpers";
import BaseElementSubject from "../scene_subjects/BaseElementSubject";
import {SubjectType} from "../scene_subjects/BaseSubject";
// import RouteSubject from "../scene_subjects/RouteSubject";
import SceneManager from "../SceneManager";
import BaseControls, {MouseButton, SubjectFilter} from "./BaseControls";
import PhotonNavigationControls from "./PhotonNavigationControls";

class PhotonSelectControls extends BaseControls {

    private static preservePosition(
        subject: IElementData,
        elementsToBePasted: IClipboardDataContent[],
        newElementPosition: IVector2) {
        const previousWidthDifferenceToFirstSubject =
            subject.diagram_position.x - elementsToBePasted[0].subject.diagram_position.x;
        const previousHeightDifferenceToFirstSubject =
            subject.diagram_position.y - elementsToBePasted[0].subject.diagram_position.y;

        newElementPosition.x = newElementPosition.x + previousWidthDifferenceToFirstSubject;
        newElementPosition.y = newElementPosition.y + previousHeightDifferenceToFirstSubject;
        return newElementPosition;
    }

    public photonNavigationControls: PhotonNavigationControls;
    public intersected: Mesh | null = null;
    public skipSelectControlMouseUpEvent: boolean = false;
    private mousePosition: Vector2 = new Vector2();

    constructor(sceneManager: SceneManager) {
        super(sceneManager);
        this.photonNavigationControls = sceneManager.photonNavigationControls;
        Clipboard.Init(this);
    }

    public onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        if (!this.enabled) {
            return;
        }

        this.updateMousePosition(event);

        this.updateIntersectingSceneSubjects(SubjectFilter.Selectable);
        this.updateIntersected();

        this.setMouseCursorSelectState();

        this.updateTerminalLabelVisibility(this.intersected);
    }

    public onMouseUp(event: MouseEvent) {
        super.onMouseUp(event);
        if (!this.enabled) {
            return;
        }
        if (event.button !== MouseButton.Main) {
            return;
        }

        const intersectedContainsSelected = this.intersectedContainsSelected();

        if (this.skipSelectControlMouseUpEvent) {
            this.skipSelectControlMouseUpEvent = false;
        } else {
            if (this.intersected) {
                if (this.intersected instanceof Line) {
                    if (this.stateManager.startingTerminal != null) {
                        const scenePos = this.sceneManager.getSceneMousePosition(event.clientX, event.clientY);
                        this.stateManager.createRoutingFromTerminalToRoutePoint(this.stateManager.startingTerminal,
                            this.intersected, scenePos);
                    }
                }
                this.stateManager.startingTerminal = null;
                if (this.stateManager.getSelectedSubjects().length > 0 && intersectedContainsSelected) {
                    this.handleUnselectSubject(event);
                    return;
                }
                this.handleSelectSubject(event);
            } else if (!this.sceneManager.photonSelectBoxControls.isActive) {
                this.handleUnselectSubject(event);
            }
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        if (!this.enabled) {
            return;
        }

        this.selectAll(event);
        this.unselectAll(event);

        if (this.stateManager.getSelectedSubjects().length === 0) {
            return;
        }

        this.copySelected(event);
        this.cutSelected(event);
        this.rotateSelected(event);
    }

    public onKeyUp(event: KeyboardEvent) {
        if (!this.enabled) {
            return;
        }
        if (this.stateManager.getSelectedSubjects().length === 0) {
            return;
        }
        this.deleteSelection(event);
    }

    public OnPaste(data: IClipboardDataContent[]) {
        this.pasteFromClipboard(data);
    }

    private updateMousePosition(event: MouseEvent) {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }

    private deleteSelection(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.delete.keys, event)) {
            event.preventDefault();
            this.stateManager.deleteSelectedSubjects();
        }
    }

    private intersectedContainsSelected() {
        const self = this;

        const foundSubject = this.stateManager.getSelectedSubjects().find((subject) => subject.clickTarget &&
            self.intersected && subject.clickTarget.uuid === self.intersected.uuid);

        if (foundSubject) {
            return true;
        } else {
            return false;
        }
    }

    private handleSelectSubject(event: MouseEvent) {
        if (!this.intersected) {
            return;
        }
        if (this.isMultiSelectKeyCommand(event)) {
            const subject = this.stateManager.findSubjectByObject3dUuid(this.intersected.uuid) as BaseElementSubject;
            if (subject) {
                this.sceneManager.stateManager.selectSubject(subject);
            }
        } else {
            const subject = this.stateManager.findSubjectByObject3dUuid(this.intersected.uuid) as BaseElementSubject;
            if (subject) {
                this.stateManager.unselectAllSubjects();
                this.stateManager.selectSubject(subject);
            }
        }
    }

    private handleUnselectSubject(event: MouseEvent) {
        if (this.stateManager.getSelectedSubjects().length === 0) {
            return;
        }
        if (this.intersected && this.isMultiSelectKeyCommand(event)) {
            const removeSubject = this.stateManager.findSubjectByObject3dUuid(this.intersected.uuid);

            if (removeSubject) {

                this.stateManager.unselectSubject(removeSubject);
            }
        } else if (this.intersected && !this.isMultiSelectKeyCommand(event)) {
            this.stateManager.unselectAllSubjects();

            const selectSubject = this.stateManager.findSubjectByObject3dUuid(this.intersected.uuid);

            if (selectSubject) {
                this.stateManager.selectSubject(selectSubject);
            }
        } else {
            this.stateManager.unselectAllSubjects();
        }
    }

    private setMouseCursorSelectState() {
        if (this.intersected) {
            this.renderer.domElement.style.cursor = "pointer";
        } else {
            this.renderer.domElement.style.cursor = "auto";
        }
    }

    private copySelected(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.copy.keys, event)) {
            event.preventDefault();
            Clipboard.Copy([...this.stateManager.getSelectedSubjects()]);
        }
    }

    private cutSelected(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.cut.keys, event)) {
            event.preventDefault();
            Clipboard.Copy([...this.stateManager.getSelectedSubjects()]);
            this.stateManager.deleteSelectedSubjects();
        }
    }

    private pasteFromClipboard(data: IClipboardDataContent[]) {
        const mapOriginElementsToCopies = new Map<string, string>();

        const elementsToBePasted = data
            .filter((subject) => subject.type === SubjectType.Element);
        const routesToBePasted = data
            .filter((subject) => subject.type === SubjectType.Route);

        this.pasteCopiedElements(elementsToBePasted, mapOriginElementsToCopies).then(() => {
            this.pasteCopiedRoutes(routesToBePasted, mapOriginElementsToCopies);
        });
    }

    private pasteCopiedRoutes(routesToBePasted: IClipboardDataContent[],
                              mapOriginElementsToCopies: Map<string, string>, notifyReact = true) {
        const routes: IRouteData[] = [];

        routesToBePasted.forEach((subject) => {
            const route = subject.subject;

            const startElement = route.endpoints.start_element_terminal.element_uid;
            const endElement = route.endpoints.end_element_terminal.element_uid;

            if (startElement && endElement) {
                const startElementDataUid = mapOriginElementsToCopies.get(
                    startElement);
                const endElementDataUid = mapOriginElementsToCopies.get(
                    endElement);

                if (startElementDataUid && endElementDataUid) {
                    const startTerminalDataUid = route.endpoints.start_element_terminal.terminal_uid;
                    const endTerminalDataUid = route.endpoints.end_element_terminal.terminal_uid;

                    if (startTerminalDataUid && endTerminalDataUid) {
                        const newRoute = DocumentStorageHelper.createNewRouteData(
                            startElementDataUid,
                            startTerminalDataUid, endElementDataUid,
                            endTerminalDataUid,
                            this.stateManager.currentUserData.uid,
                        );

                        routes.push(newRoute);
                    }
                }
            }
        });

        return this.stateManager.addSubjects(routes, true, notifyReact);
    }

    private pasteCopiedElements(elementsToBePasted: IClipboardDataContent[],
                                mapOriginElementsToCopies: Map<string, string>) {
        const worldMousePosition = this.sceneManager.getSceneMousePosition(this.mousePosition.x, this.mousePosition.y);

        const elements: IElementData[] = [];
        elementsToBePasted.forEach((element, index) => {

            if (element.subject.part_version_data_cache) {
                const elementData = element.subject as IElementData;

                let newElementPosition =
                    PartStorageHelper.createElementPosition(
                        true,
                        worldMousePosition.x,
                        worldMousePosition.y,
                        elementData.diagram_position.orientation,
                        elementData.diagram_position.flip);

                if (index > 0) {
                    newElementPosition =
                        PhotonSelectControls.preservePosition(elementData, elementsToBePasted, newElementPosition);
                }
                const newElement = DocumentStorageHelper.createNewElementData(
                    elementData.part_version_data_cache,
                    newElementPosition,
                );

                if (elementData.label) {
                    newElement.label = elementData.label;
                }

                mapOriginElementsToCopies.set(elementData.uid, newElement.uid);

                newElement.properties = elementData.properties;

                elements.push(newElement);
            }
        });

        return this.stateManager.addSubjects(elements, true, true);
    }

    private rotateSelected(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.rotate_clockwise.keys, event) ||
            HotKeysHelper.isHotkey(R.keyCommands.rotate_counter_clockwise.keys, event)) {
            event.preventDefault();
            this.stateManager.getSelectedSubjects().forEach((subject) => {
                const selectedSubjectData = subject.getSubjectData() as IElementData;

                let orientation = selectedSubjectData.diagram_position.orientation || 0;

                if (HotKeysHelper.isHotkey(R.keyCommands.rotate_clockwise.keys, event)) {
                    orientation = orientation - getRotationStep();
                } else if (HotKeysHelper.isHotkey(R.keyCommands.rotate_counter_clockwise.keys, event)) {
                    orientation = orientation + getRotationStep();
                }

                selectedSubjectData.diagram_position.orientation = orientation;

                subject.updateFromData(selectedSubjectData);
            });

            this.stateManager.updateDocumentData(true);
        }
    }

    private selectAll(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.select_all.keys, event)) {
            event.preventDefault();
            this.sceneManager.stateManager.selectAllSubjects();
        }
    }

    private unselectAll(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.unselect_all.keys, event)) {
            event.preventDefault();
            this.sceneManager.stateManager.unselectAllSubjects();
        }
    }
}

export default PhotonSelectControls;
