import {
    Box3,
    DoubleSide,
    Group,
    Line,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneBufferGeometry,
    Scene,
    Vector3,
} from "three";
import {MeshText2D, textAlign} from "three-text2d";
import R from "../../../resources/Namespace";
import {deepCopy, ISegmentData, ISubjectData, ITerminalData} from "../../../storage_engine/models/FirebaseDataModels";

export interface ITerminal {
    mesh: Mesh;
    terminalData: ITerminalData;
    terminalLabelMesh?: MeshText2D|undefined;
}

export enum SubjectType {
    Element = 0,
    Route = 1,
    RouteSegment = 2,
}

class BaseSubject {

    get isDragable() {
        return false;
    }

    get isSelectable() {
        return false;
    }

    get isSelected() {
        return this.selected;
    }

    public sceneObject: Object3D | Mesh | Line | Group | null = null;
    public clickTarget: Mesh | Line | undefined;

    public readonly subjectUid: string;
    public readonly subjectType: SubjectType;
    protected subjectData: ISubjectData | ISegmentData;
    protected secondaryLabelMesh: MeshText2D | undefined;
    protected primaryLabelMesh: MeshText2D | undefined;
    protected scene: Scene;
    protected zLevel: number = R.layout.z_order.default;
    protected selected: boolean = false;

    protected debugMode: boolean = false;

    constructor(scene: Scene, subjectType: SubjectType, subjectData: ISubjectData | ISegmentData) {
        this.scene = scene;
        this.subjectType = subjectType;

        this.subjectData = subjectData;
        this.subjectUid = subjectData.uid;
    }

    public updateFromData(subjectData: ISubjectData | ISegmentData) {
        this.subjectData = deepCopy(subjectData);
    }

    public destroy() {
        if (!this.sceneObject) {
            return;
        }

        this.scene.remove(this.sceneObject);
    }

    public setSelected() {
        this.selected = true;
    }

    public setUnselected() {
        this.selected = false;
    }

    public getSubjectData(): ISubjectData | ISegmentData {
        return this.subjectData;
    }

    public getSize(symbolOnly = false): Vector3 {
        const size = new Vector3();
        if (!this.sceneObject) {
            return size;
        }

        const boundingBox = new Box3().setFromObject(this.sceneObject);
        boundingBox.getSize(size);

        return size;
    }

    public getPosition(symbolOnly = false): Vector3 {
        let position = new Vector3();
        if (!this.sceneObject) {
            return position;
        }

        position = this.sceneObject.position;

        return position;
    }

    public isWithinBounds(min: Vector3, max: Vector3, symbolOnly = false) {
        const subjectSize = this.getSize(symbolOnly);
        const subjectPosition = this.getPosition(symbolOnly);

        const halfSize = 2;
        const subjectMinX = subjectPosition.x - (subjectSize.x / halfSize);
        const subjectMaxX = subjectPosition.x + (subjectSize.x / halfSize);
        const subjectMinY = subjectPosition.y + (subjectSize.y / halfSize);
        const subjectMaxY = subjectPosition.y - (subjectSize.y / halfSize);

        return subjectMaxX >= min.x &&
            subjectMinX <= max.x &&
            subjectMaxY <= min.y &&
            subjectMinY >= max.y;
    }

    public update(elapsedTime: number) {

    }

    protected getDebugMesh(container: Group | Mesh | Object3D | MeshText2D) {

        const svgSize = new Vector3();
        const boundingBox = new Box3().setFromObject(container);
        boundingBox.getSize(svgSize);

        const frameGeometry =
            new PlaneBufferGeometry(svgSize.x, svgSize.y, 0);

        const material = new MeshBasicMaterial({
           color: R.colors.debug,
           transparent: true,
           opacity: 0.5,
           side: DoubleSide,
        });

        const mesh = new Mesh(frameGeometry, material);

        return mesh;

    }

    protected getElementSize(svgGroup: Group | Mesh | MeshText2D | Object3D) {
        const svgSize = new Vector3();
        const boundingBox = new Box3().setFromObject(svgGroup);
        boundingBox.getSize(svgSize);
        return svgSize;
    }

    protected createLabel(content: string,
                          position: Vector3,
                          align = textAlign.center,
                          color = R.colors.foreground,
                          opacity = 1) {
        const labelMesh = new MeshText2D(
            content,
            {
                align,
                antialias: true,
                fillStyle: color,
                backgroundColor: "#FF0000",
                font: R.layout.labels.max_zoom_label_font_size + "px " + R.fonts.element_labels,
            });

        labelMesh.scale.multiplyScalar(1 / (R.layout.labels.max_zoom_label_font_size / R.layout.labels.font_size));
        labelMesh.position.set(position.x, position.y, position.z);
        labelMesh.material.opacity = opacity;
        return labelMesh;
    }
}

export default BaseSubject;
