import {Intersection, Mesh, Object3D} from "three";
import R from "../../../resources/Namespace";
import {DocumentStorageHelper} from "../../../storage_engine/helpers/DocumentStorageHelper";
import {IElementData, ITerminalData} from "../../../storage_engine/models/FirebaseDataModels";
import { HotKeysHelper } from "../../keyboard_shortcuts/helpers/HotKeysHelper";
import BaseElementSubject from "../scene_subjects/BaseElementSubject";
import BaseSubject, {ITerminal, SubjectType} from "../scene_subjects/BaseSubject";
import ModuleSubject from "../scene_subjects/ModuleSubject";
import StandardSymbolSubject from "../scene_subjects/StandardSymbolSubject";
import BaseControls, {MouseButton} from "./BaseControls";

export interface IElementAndTerminal {
    element_data: IElementData;
    terminal_data: ITerminalData;
}

class PhotonRouteControls extends BaseControls {

    public intersectingTerminals: Intersection[] = [];
    public terminalToSubjectMap: Map<ITerminal, BaseSubject> = new Map<ITerminal, BaseSubject>();
    public startTerminal: Object3D | null = null;
    public endTerminal: Object3D | null = null;

    public onKeyUp(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.escape_routing.keys, event)) {
            this.resetRoutingControl();
            this.stateManager.startingTerminal = null;
        }
    }

    public onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        if (!this.enabled) {
            return;
        }

        this.setIntersectingSceneSubjectTerminals();

        if (this.intersectingTerminals.length > 0) {
            this.renderer.domElement.style.cursor = "pointer";

            const elementAndTerminal = this.getElementAndTerminalDataFromObject3D(this.intersectingTerminals[0].object);
            if (elementAndTerminal) {
                const subject = this.stateManager
                    .findSubjectByUid((elementAndTerminal as IElementAndTerminal).element_data.uid);
                if (subject && subject.sceneObject) {
                    const elementSubject = subject instanceof StandardSymbolSubject ?
                                            subject as StandardSymbolSubject :
                                            subject as ModuleSubject;
                    elementSubject.showTerminal(true);
                }
            }
        }

        if (this.startTerminal) {
            this.renderer.domElement.style.cursor = "crosshair";
        }
    }

    public onMouseUp(event: MouseEvent): boolean {
        super.onMouseUp(event);
        if (!this.enabled) {
            return false;
        }

        if (event.button !== MouseButton.Main) {
            return false;
        }

        if (this.sceneManager.photonDragControls.skipRouteControlMouseUpEvent) {
            this.sceneManager.photonDragControls.skipRouteControlMouseUpEvent = false;
            return false;
        }

        this.setIntersectingSceneSubjectTerminals();
        if (this.intersectingTerminals.length > 0) {
            this.sceneManager.photonSelectControls.skipSelectControlMouseUpEvent = true;
            if (this.startTerminal == null && this.endTerminal == null) {
                this.startRouting();
                return true;
            } else {
                this.endRouting();
            }
        }

        if (this.intersectingTerminals.length === 0 && this.startTerminal) {
            this.resetRoutingControl();
        }
        return false;
    }

    public update(delta: number) {

    }

    private startRouting() {
        this.sceneManager.photonDragControls.enabled = false;
        this.startTerminal = this.intersectingTerminals[0].object;
        this.renderer.domElement.style.cursor = "crosshair";
        const startTerminalData = this.getElementAndTerminalDataFromObject3D(this.startTerminal);
        this.stateManager.startingTerminal = startTerminalData;
    }

    private endRouting() {
        if (!this.startTerminal) {
            this.resetRoutingControl();
            return;
        }

        this.endTerminal = this.intersectingTerminals[0].object;
        const startTerminalData = this.getElementAndTerminalDataFromObject3D(this.startTerminal);
        const endTerminalData = this.getElementAndTerminalDataFromObject3D(this.endTerminal);

        if (startTerminalData && endTerminalData) {
            const routeData = this.createRouteElementData(startTerminalData, endTerminalData);

            if (routeData) {
                this.stateManager.addSubject(routeData, true, true);
                this.resetRoutingControl();
            }
        }
        this.stateManager.startingTerminal = null;
    }

    private createRouteElementData(startTerminalData: IElementAndTerminal, endTerminalData: IElementAndTerminal) {
        if (!startTerminalData || !endTerminalData) {
            return;
        }

        const startElementDataUid = startTerminalData.element_data.uid;
        const endElementDataUid = endTerminalData.element_data.uid;
        const startTerminalDataUid = startTerminalData.terminal_data.uid;
        const endTerminalDataUid = endTerminalData.terminal_data.uid;

        return DocumentStorageHelper.createNewRouteData(
            startElementDataUid,
            startTerminalDataUid, endElementDataUid,
            endTerminalDataUid,
            this.stateManager.currentUserData.uid,
        );
    }

    private resetRoutingControl() {
        this.startTerminal = null;
        this.endTerminal = null;
        this.sceneManager.photonDragControls.enabled = true;
        this.sceneManager.photonSelectControls.enabled = true;

        this.renderer.domElement.style.cursor = "auto";
    }

    private getElementAndTerminalDataFromObject3D(terminal: Object3D): IElementAndTerminal | null {
        let terminalData: ITerminalData | null = null;
        let elementData: IElementData | null = null;

        this.terminalToSubjectMap.forEach((value: BaseSubject, key: ITerminal) => {
            if (key.mesh.id === terminal.id) {
                terminalData = key.terminalData as ITerminalData;
                elementData = value.getSubjectData() as IElementData;
            }
        });
        if (terminalData && elementData) {
            return {terminal_data: terminalData, element_data: elementData};
        } else {
            return null;
        }
    }

    private setIntersectingSceneSubjectTerminals() {
        // ordered by distance (closest first)
        this.terminalToSubjectMap = this.getTerminalsAndSubjects();

        const meshes: Mesh[] = [];

        this.terminalToSubjectMap.forEach((value: BaseSubject, key: ITerminal) => {
            meshes.push(key.mesh);
        });

        this.intersectingTerminals = this.getLocalIntersects(meshes);
    }

    private getTerminalsAndSubjects(): Map<ITerminal, BaseElementSubject> {
        const clickableSceneSubjectTerminals = new Map<ITerminal, BaseElementSubject>();

        if (this.sceneManager) {
            this.stateManager.getSubjectsByType(SubjectType.Element).forEach((subject) => {
                const elementSubject = subject as BaseElementSubject;

                elementSubject.terminals.forEach((terminal: ITerminal) => {
                    clickableSceneSubjectTerminals.set(terminal, elementSubject);
                });
            });
        }

        return clickableSceneSubjectTerminals;
    }
}

export default PhotonRouteControls;
