import {Mesh, Vector2} from "three";
import BaseSubject from "../scene_subjects/BaseSubject";
import BaseControls, {MouseButton, SubjectFilter} from "./BaseControls";

class PhotonSelectBoxControls extends BaseControls {

    public intersected: Mesh | null = null;
    private mouseSelectBoxMode: boolean = false;
    private drawMode: boolean = false;

    private element: HTMLDivElement = document.createElement("div");
    private startPoint = new Vector2();
    private pointTopLeft = new Vector2();
    private pointBottomRight = new Vector2();

    constructor(sceneManager: any) {
        super(sceneManager);

        this.createSelectElement();
    }

    get isActive() {
        return this.drawMode;
    }

    public onMouseMove(event: MouseEvent) {
        super.onMouseMove(event);
        if (!this.enabled) {
            return;
        }

        this.updateIntersectingSceneSubjects(SubjectFilter.Selectable);
        this.updateIntersected();

        this.onSelectMove(event);
    }

    public onMouseDown(event: MouseEvent) {
        super.onMouseDown(event);

        if (!this.enabled) {
            return;
        }
        if (event.button !== MouseButton.Main) {
            return;
        }

        if (!this.intersected) {
            this.onSelectStart(event);
        }
    }

    public onMouseUp(event: MouseEvent) {
        super.onMouseUp(event);
        if (!this.enabled) {
            return;
        }
        if (event.button !== MouseButton.Main) {
            return;
        }

        this.onSelectEnd(event);
    }

    private onSelectStart(event: MouseEvent) {
        if (this.sceneManager &&
            this.sceneManager.renderer &&
            this.sceneManager.canvas &&
            this.sceneManager.canvas.parentElement) {

            this.sceneManager.canvas.parentElement.appendChild(this.element);

            this.element.style.left = event.clientX + "px";
            this.element.style.top = event.clientY + "px";
            this.element.style.width = "0px";
            this.element.style.height = "0px";

            this.startPoint.x = event.clientX;
            this.startPoint.y = event.clientY;

            this.mouseSelectBoxMode = true;
        }
    }

    private onSelectMove(event: MouseEvent) {
        if (this.mouseSelectBoxMode) {
            this.drawMode = true;
            this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
            this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
            this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
            this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

            this.element.style.left = this.pointTopLeft.x + "px";
            this.element.style.top = this.pointTopLeft.y + "px";
            this.element.style.width = (this.pointBottomRight.x - this.pointTopLeft.x) + "px";
            this.element.style.height = (this.pointBottomRight.y - this.pointTopLeft.y) + "px";

            this.renderer.domElement.style.cursor = "crosshair";
        }
    }

    private onSelectEnd(event: MouseEvent) {
        if (!this.mouseSelectBoxMode) {
            return;
        }

        if (!this.isMultiSelectKeyCommand(event)) {
            this.stateManager.unselectAllSubjects();
        }

        this.selectSubjectsInSelectBox();

        this.resetSelectBox();
        this.mouseSelectBoxMode = false;
        this.drawMode = false;
    }

    private resetSelectBox() {
        this.startPoint.x = 0;
        this.startPoint.y = 0;
        this.pointBottomRight.x = 0;
        this.pointBottomRight.y = 0;
        this.pointTopLeft.x = 0;
        this.pointTopLeft.y = 0;

        if (this.sceneManager &&
            this.sceneManager.canvas &&
            this.sceneManager.canvas.parentElement) {
            this.sceneManager.canvas.parentElement.removeChild(this.element);
        }

        this.renderer.domElement.style.cursor = "auto";
    }

    private createSelectElement() {
        this.element.classList.add("selectBox");
        this.element.style.pointerEvents = "none";
    }

    private selectSubjectsInSelectBox() {
        this.sceneSubjects.forEach((subject: BaseSubject) => {
            if (!subject.isSelectable) {
                return;
            }
            if (this.subjectIsWithinSelectBox(subject)) {
                subject.setSelected();
            }
        });

        this.stateManager.propagateSelectedSubjectsState();
    }

    private subjectIsWithinSelectBox(subject: BaseSubject) {
        const sceneTopLeft = this.sceneManager.getSceneMousePosition(
            this.pointTopLeft.x,
            this.pointTopLeft.y,
        );

        const sceneBottomRight = this.sceneManager.getSceneMousePosition(
            this.pointBottomRight.x,
            this.pointBottomRight.y,
        );

        return subject.isWithinBounds(sceneTopLeft, sceneBottomRight, true);
    }
}

export default PhotonSelectBoxControls;
