import {evaluate} from "mathjs";
import * as path from "path";
import {
    Box3,
    Color,
    DoubleSide,
    Group,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneBufferGeometry,
    Scene,
    Vector3,
} from "three";
import {MeshText2D, textAlign} from "three-text2d";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {SVGLoader, SVGResult} from "three/examples/jsm/loaders/SVGLoader";
import R from "../../../resources/Namespace";
import {IElementData, ITerminalData} from "../../../storage_engine/models/FirebaseDataModels";
import {getRotationStep, radiansToDegrees} from "../helpers/PhotonEngineHelpers";
import BaseElementSubject from "./BaseElementSubject";

class StandardSymbolSubject extends BaseElementSubject {

    get isDragable() {
        return true;
    }

    get isSelectable() {
        return true;
    }

    private static getSymbolSize(svgGroup: Group | Mesh | MeshText2D | Object3D) {
        const svgSize = new Vector3();
        const boundingBox = new Box3().setFromObject(svgGroup);
        boundingBox.getSize(svgSize);
        return svgSize;
    }

    private static getTerminalLabelContent(terminalData: ITerminalData) {
        if (terminalData.name && terminalData.type) {
            return terminalData.name + " (" + terminalData.type + ")";
        } else if (terminalData.type) {
            return terminalData.type;
        } else if (terminalData.name) {
            return terminalData.name;
        }

        return null;
    }

    private static getFileExtension(symbolResourceFilePath: string) {
        const regex = /(?:\.([^.]+))?$/;
        const regexResult = regex.exec(symbolResourceFilePath);
        if (regexResult && regexResult.length > 1) {
            return regexResult[1];
        }
        return null;
    }

    private static svgToGroup(data: any) {
        let mesh;
        let geometry;
        const dataPaths = data.paths;
        const group = new Group();

        group.scale.multiplyScalar(1);
        group.scale.y *= -1;

        dataPaths.forEach((dataPath: any) => {
            const strokeColor = dataPath.userData.style.stroke;

            if (strokeColor !== "none") {
                const svgMaterial = new MeshBasicMaterial({
                    color: new Color().setStyle(R.colors.elements.foreground),
                    depthWrite: false,
                    opacity: dataPath.userData.style.strokeOpacity,
                    side: DoubleSide,
                    transparent: dataPath.userData.style.strokeOpacity < 1,
                    wireframe: false,
                });

                let y = 0;
                const subPathLength = dataPath.subPaths.length;
                for (; y < subPathLength; y++) {
                    const subPath = dataPath.subPaths[y];

                    geometry =
                        SVGLoader.pointsToStroke(subPath.getPoints(), dataPath.userData.style, 0, 0);

                    if (geometry) {
                        mesh = new Mesh(geometry, svgMaterial);
                        group.add(mesh);
                    }
                }
            }
        });

        return group;
    }
    protected symbol: Group | undefined;

    private elementValue: string = "";
    private elementValueUnit: string = "";
    private readonly framePadding: number = R.layout.elements.framePadding;

    constructor(scene: Scene, elementData: IElementData) {
        super(scene, elementData);

        this.zLevel = R.layout.z_order.element;

        this.updatedPartVersionData();
        this.populateElementValue(elementData);
    }

    public create() {
        const promise = this.createSymbolFromUri();
        if (promise) {
            return promise;
        } else {
            return super.create();
        }
    }

    public update(time: number) {
        this.setHighlightState();
    }

    public updateFromData(subjectData: IElementData) {
        super.updateFromData(subjectData);
        this.updatedPartVersionData();

        this.updateLabels();
        this.adjustLabelsbyOrientation();

    }

    public showTerminal(visible: boolean) {

        const self = this;

        // Lowest terminal point
        let lowestTerminalYPosition: number = 0;

        this.terminals.forEach((terminal) => {
            if (!terminal.mesh) {
                return;
            }

            const terminalMeshPosition = new Vector3();
            terminal.mesh.getWorldPosition(terminalMeshPosition);

            if (!lowestTerminalYPosition || lowestTerminalYPosition > terminalMeshPosition.y) {
                lowestTerminalYPosition = terminalMeshPosition.y;
            }

        });

        this.terminals.forEach((terminal) => {
            if (!terminal.mesh) {
                return;
            }

            const terminalMeshPosition = new Vector3();
            terminal.mesh.getWorldPosition(terminalMeshPosition);

            if (terminal.terminalLabelMesh && visible) {
                let y;
                if (terminalMeshPosition.y > lowestTerminalYPosition + 0.1) {
                    y = terminalMeshPosition.y + 15;
                } else {
                    y = terminalMeshPosition.y - 10;
                }

                terminal.terminalLabelMesh.position.set(terminalMeshPosition.x, y, terminalMeshPosition.z);
                self.scene.add(terminal.terminalLabelMesh);
            } else if (terminal.terminalLabelMesh && !visible) {
                self.scene.remove(terminal.terminalLabelMesh);
 }

            const material = terminal.mesh.material as MeshBasicMaterial;
            material.transparent = !visible;

        });
    }

    private adjustLabelsbyOrientation() {
        if (!this.primaryLabelMesh || !this.secondaryLabelMesh) {
            return;
        }

        const elementData = (this.getSubjectData());
        const orientation = elementData.diagram_position.orientation || 0;
        const orientationInDegrees = Math.round(radiansToDegrees(orientation));
        const normalizedOrientation = Math.abs( orientationInDegrees / radiansToDegrees(getRotationStep()));

        // alert("Orientation is " + (normalizedOrientation % 4)*90)

        if (normalizedOrientation % 4 === 1 || normalizedOrientation % 4 === 3) {
            this.primaryLabelMesh.position
                .set(-2 * R.layout.labels.padding - this.symbolSize.y,
                    1.5 * R.layout.labels.padding, R.layout.z_order.element);

            if (this.primaryLabelMesh.text) {
                this.secondaryLabelMesh.position
                    .set(-2 * R.layout.labels.padding - this.symbolSize.y,
                        - 0.5 * R.layout.labels.padding, R.layout.z_order.element);
            } else {
                this.secondaryLabelMesh.position
                    .set(-2 * R.layout.labels.padding - this.symbolSize.y,
                        0.5 * R.layout.labels.padding, R.layout.z_order.element);
            }
        } else {
            const upperLabelYPosition = R.layout.labels.padding + this.labelFontSize + this.symbolSize.y;
            this.primaryLabelMesh.position
                .set(0, upperLabelYPosition, R.layout.z_order.element);

            this.secondaryLabelMesh.position
                .set(0, R.layout.labels.padding + this.symbolSize.y,
                    R.layout.z_order.element);
        }
    }

    private populateElementValue(elementData: IElementData) {
        const elementValue = elementData.properties.get("value");

        if (elementValue) {
            this.elementValue = elementValue.value as string;
            this.elementValueUnit = elementValue.unit as string;
        }
    }

    private setHighlightState() {
        if (!this.symbol) {
            return;
        }

        const self = this;
        this.symbol.children.forEach((child) => {
            const mesh = child as Mesh;
            const material = mesh.material as MeshBasicMaterial;

            if (self.selected) {
                material.color.set(R.colors.highlighted);
            } else {
                material.color.set(R.colors.elements.foreground);
            }
        });

        this.setLabelHighlightState(this.primaryLabelMesh);
        this.setLabelHighlightState(this.secondaryLabelMesh);
    }

    private createTerminals() {
        if (!this.partVersionData) {
            return;
        }

        const self = this;
        this.partVersionData.terminals.forEach((terminalData) => {
            if (self.sceneObject == null) {
                return;
            }

            const terminalMesh = this.createTerminalClickTargetMesh();
            let terminalLabelMesh;

            if (terminalData.position) {
                const x = terminalData.position.x as number;
                const y = terminalData.position.y as number;

                terminalMesh.position.set(x, y + (this.symbolSize.y / 2), R.layout.z_order.terminal);
            }

            const terminalLabelContent = StandardSymbolSubject.getTerminalLabelContent(terminalData);
            if (terminalLabelContent) {

                // let textAlignment

                // if (terminalData.position && terminalData.position?.x > 0)
                //     textAlignment = textAlign.bottomLeft;

                // if (terminalData.position && terminalData.position?.x < 0)
                //     textAlignment = textAlign.bottomRight;

                // if (terminalData.label_alignment === "right") {
                //     textAlignment = textAlign.bottomRight;
                // }

                terminalLabelMesh = this.createLabel(
                    terminalLabelContent,
                    new Vector3(0, 0, self.zLevel),
                    textAlign.center,
                    R.colors.elements.terminals.hoverLabels,
                    R.colors.elements.terminals.opacity,
                );
                terminalLabelMesh.visible = true;
                // this.terminalLabels.push(terminalLabelMesh)
                // self.sceneObject.add(terminalLabelMesh);
            }

            self.clickTarget?.add(terminalMesh);

            self.terminals.push({ mesh: terminalMesh, terminalData, terminalLabelMesh });
        });
    }

    private createSymbolFromUri() {
        if (!this.partVersionData || !this.partVersionData.symbol_resource_file) {
            return;
        }
        const symbolResourceFilePath = path.join("/", "symbols", this.partVersionData.symbol_resource_file);

        const fileExtension = StandardSymbolSubject.getFileExtension(symbolResourceFilePath);

        if (fileExtension === "svg") {
            return this.loadSVG(symbolResourceFilePath);
        } else if (fileExtension === "glb") {
            return this.loadGLTF(symbolResourceFilePath);
        }
    }

    private loadSVG(symbolResourceFilePath: string) {
        const self = this;

        return new Promise<string>((resolve, reject) => {
            new SVGLoader().load(symbolResourceFilePath,
                // called when the resource is loaded
                (data: SVGResult) => {
                    const group = StandardSymbolSubject.svgToGroup(data);
                    this.createSubjectFromMesh(self, group);
                    resolve();
                },
                // called when loading is in progresses
                () => {
                },
                // called when loading has errors
                (error: ErrorEvent) => {
                    console.error("An error happened loading an SVG file", error);
                    reject();
                });
        });
    }

    private loadGLTF(symbolResourceFilePath: string) {
        return new Promise<string>((resolve, reject) => {
            const loader = new GLTFLoader();

            const self = this;
            loader.load(
                symbolResourceFilePath,
                (gltf: GLTF) => {
                    const group = this.gltfToGroup(gltf);

                    this.createSubjectFromMesh(self, group);
                    resolve();
                },
                () => {
                },
                (error: ErrorEvent) => {
                    console.error("An error happened loading a GLB file", error);
                    reject();
                },
            );
        });
    }

    private createSubjectFromMesh(self: StandardSymbolSubject, mesh: Group) {
        this.symbolSize = StandardSymbolSubject.getSymbolSize(mesh);
        // mesh.position.set(-(symbolSize.x / 2) - 10, (symbolSize.y / 2) + 10 - this.labelFontSize, this.zLevel);
        self.symbol = mesh;

        self.sceneObject = new Group();
        self.clickTarget = self.createClickTarget(self.symbol);

        // Add symbol to click target mesh
        self.clickTarget.add(self.symbol);

        // Add click target to scene object group
        self.sceneObject.add(self.clickTarget);

        self.secondaryLabelMesh = self.createLabel(
            self.getValueLabelContent(),
            new Vector3(0, 0, this.zLevel),
            textAlign.center,
            R.colors.elements.labels.foreground,
            R.colors.elements.labels.opacity,
        );
        self.sceneObject.add(self.secondaryLabelMesh);

        // Set size of the text symbol
        this.secondaryLabelSize = StandardSymbolSubject.getSymbolSize(self.secondaryLabelMesh);

        self.primaryLabelMesh = self.createLabel(
            self.getNameLabelContent(),
            new Vector3(0, 0, this.zLevel),
            textAlign.center,
            R.colors.elements.labels.foreground,
            R.colors.elements.labels.opacity,
        );
        self.sceneObject.add(self.primaryLabelMesh);

        // Set size of the text symbol
        this.labelSize = this.getElementSize(self.primaryLabelMesh.mesh);

        self.setMeshNameForDebugging();

        // if(self.debugMode){
        //     const debugMesh = this.getDebugMesh(self.sceneObject);
        //     self.sceneObject.add(debugMesh);

        //     const debugMesh2 = this.getDebugMesh(self.clickTarget);
        //     self.clickTarget.add(debugMesh2);

        //     const debugMesh3 = this.getDebugMesh(self.secondaryLabelMesh);
        //     self.secondaryLabelMesh.add(debugMesh3);

        //     const debugMesh4 = this.getDebugMesh(self.primaryLabelMesh);
        //     self.primaryLabelMesh.add(debugMesh4);
        // }

        self.scene.add(self.sceneObject);

        self.updateFromData(self.getSubjectData() as IElementData);

        self.createTerminals();

    }

    private getFrameHeight(self: StandardSymbolSubject) {
        if (!self.symbol) {
            return 0;
        }
        const symbolSize = StandardSymbolSubject.getSymbolSize(self.symbol);
        return symbolSize.y; // + this.framePadding + this.labelHeight;
    }

    private gltfToGroup(gltf: GLTF) {
        const material = new MeshBasicMaterial({
            color: new Color().setStyle(R.colors.elements.foreground),
            depthWrite: false,
            side: DoubleSide,
            wireframe: false,
        });

        const group = new Group();
        group.scale.multiplyScalar(1);
        group.scale.y *= -1;

        gltf.scene.traverse((child: any) => {
            if (child instanceof Mesh) {
                child.material = material;
                group.add(child.clone());
            }
        });

        return group;
    }

    private createClickTarget(symbolGroup: Group) {

        const frameHeight = this.symbolSize.y; // + this.framePadding + this.labelHeight;
        const frameWidth = this.symbolSize.x + this.framePadding;

        symbolGroup.position.x = - (this.symbolSize.x / 2);
        symbolGroup.position.y = (this.symbolSize.y / 2);

        const materialConfig = {
            color: R.colors.debug,
            opacity: 0.0,
            transparent: true,
            side: DoubleSide,
        };

        const meshBasicMaterial = new MeshBasicMaterial(materialConfig);
        const frameGeometry =
            new PlaneBufferGeometry(frameWidth, frameHeight, 0);

        const mesh = new Mesh(frameGeometry, meshBasicMaterial);

        // mesh.position.set(0, 0, this.zLevel);

        return mesh;
    }

    private updateLabels() {
        if (!this.sceneObject) {
            return;
        }
        if (!this.symbol) {
            return;
        }

        if (this.primaryLabelMesh) {
            const nameLabelContent = this.getNameLabelContent();
            this.primaryLabelMesh.text = nameLabelContent;
            this.primaryLabelMesh.updateText();
        }

        if (this.secondaryLabelMesh) {
            this.populateElementValue(this.getSubjectData() as IElementData);

            const valueLabelContent = this.getValueLabelContent();
            this.secondaryLabelMesh.text = valueLabelContent;
            this.secondaryLabelMesh.updateText();
        }
    }

    private getValueLabelContent() {
        try {
            const scope = {
                a: 3,
                b: 4,
                ohmsLaw: (voltageSource: number, voltageDrop: number, current: number) => {
                    return (voltageSource - voltageDrop) / current;
                },
            };

            const evaluatedElementValue = evaluate(this.elementValue, scope);

            if (!isNaN(Number(evaluatedElementValue))) {
                return evaluatedElementValue + this.elementValueUnit;
            } else {
                return "";
            }
        } catch (e) {
            return "";
        }
    }

    private getNameLabelContent() {
        try {
            const elementData = this.subjectData as IElementData;
            return elementData.label || "";
        } catch (e) {
            return "";
        }
    }
}

export default StandardSymbolSubject;
