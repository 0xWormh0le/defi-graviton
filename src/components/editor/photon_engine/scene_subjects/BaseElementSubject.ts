import { Box3, CircleBufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D, Scene, Vector3 } from "three";
import { MeshText2D } from "three-text2d";
import R from "../../../resources/Namespace";
import { IElementData, IPartVersionData } from "../../../storage_engine/models/FirebaseDataModels";

import { getRotationStep } from "../helpers/PhotonEngineHelpers";
import BaseSubject, { ITerminal, SubjectType } from "./BaseSubject";

class BaseElementSubject extends BaseSubject {

    public terminalLabels: any = [];

    // Make these guys publically readable and privately settable
    public symbolSize: Vector3 = new Vector3(0, 0, 0);
    public labelSize: Vector3 = new Vector3(0, 0, 0);
    public secondaryLabelSize: Vector3 = new Vector3(0, 0, 0);

    // // Adjust label when orientation changes
    // adjustLabelMeshBasedOnOrientation:any = null;

    public terminals: ITerminal[] = [];
    public partVersionData: IPartVersionData | undefined;
    protected symbol: any = null;
    protected readonly labelHeight: number = R.layout.elements.labelHeight;
    protected readonly labelFontSize: number = R.layout.elements.labelFontSize;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(scene: Scene, subjectData: IElementData) {
        super(scene, SubjectType.Element, subjectData);
    }

    public create() {
        return new Promise<string>((resolve) => {
            resolve();
        });
    }

    public updateFromData(subjectData: IElementData) {
        super.updateFromData(subjectData);

        this.updatePosition();
        this.updateOrientation();
    }

    public getTerminal(terminalUid: string) {
        return this.terminals.find((terminal) => terminal.terminalData.uid === terminalUid);
    }

    public getSize(): Vector3 {
        const size = new Vector3();
        if (!this.sceneObject) {
            return size;
        }

        const boundingBox = new Box3().setFromObject(this.sceneObject);
        boundingBox.getSize(size);

        return size;
    }

    public get isFlipped(): boolean {

        if (!this.clickTarget) {
            return false;
        }

        if (Math.floor(this.clickTarget.rotation.y) === Math.floor(getRotationStep() * 2)) {
            return true;
        } else if (this.clickTarget.rotation.y === 0) {
            return false;
        }

        return false;
    }

    public getPosition(): Vector3 {
        /* It returns origin, if position is not set yet
         * Otherwise, return the position
        */
        if (!this.sceneObject) {
            return new Vector3();
        }

        return this.sceneObject.position;
    }

    public destroy() {
        super.destroy();

        const self = this;

        // Also remove all terminal labels
        this.terminals.forEach((terminal) => {
            if (terminal.terminalLabelMesh) {
                self.scene.remove(terminal.terminalLabelMesh);
            }
        });
    }

    public getSubjectData() {
        return super.getSubjectData() as IElementData;
    }

    public getSymbolSize(symbolOnly = false): Vector3 {
        const size = new Vector3();
        if (!this.sceneObject) {
            return size;
        }

        if (this.clickTarget) {
            const boundingBox = new Box3().setFromObject(this.clickTarget as Object3D);
            boundingBox.getSize(size);
            return size;
        } else {
            return new Vector3(0, 0, 0);
        }

    }

    protected updatedPartVersionData() {
        const elementData = this.getSubjectData();

        this.partVersionData = elementData.part_version_data_cache;
    }

    protected setLabelHighlightState(labelMesh: MeshText2D | undefined) {
        if (labelMesh) {
            const labelMaterial = labelMesh.material as MeshBasicMaterial;
            if (this.selected) {
                labelMaterial.color.set(R.colors.highlighted);
            } else {
                labelMaterial.color.set(R.colors.elements.foreground);
            }
        }
    }

    protected createTerminalClickTargetMesh() {
        const segments = 32;
        const geometry = new CircleBufferGeometry(R.layout.terminals.radius, segments);
        const material = new MeshBasicMaterial({
            color: R.colors.foreground,
            side: DoubleSide,
            transparent: true,
            opacity: 0,
        });

        return new Mesh(geometry, material);
    }

    protected setMeshNameForDebugging() {
        if (this.sceneObject && this.partVersionData) {
            this.sceneObject.name = this.partVersionData.name;
        }
    }

    private updatePosition() {
        if (!this.sceneObject) {
            return;
        }

        const elementData = (this.getSubjectData());

        const x = elementData.diagram_position.x;
        const y = elementData.diagram_position.y;
        const z = this.zLevel;

        elementData.diagram_position.scene_cursor_position = true;

        this.subjectData = elementData;
        this.sceneObject.position.set(x, y, z);
    }

    private updateOrientation() {
        if (!this.sceneObject || !this.primaryLabelMesh || !this.secondaryLabelMesh || !this.clickTarget) {
            return;
        }

        const elementData = (this.getSubjectData());
        const orientation = elementData.diagram_position.orientation || 0;
        const flip = elementData.diagram_position.flip || false;

        this.clickTarget.rotation.z = orientation;

        if (flip) {
            this.clickTarget.rotation.y = getRotationStep() * 2;
        } else {
            this.clickTarget.rotation.y = 0;
        }

    }
}

export default BaseElementSubject;
