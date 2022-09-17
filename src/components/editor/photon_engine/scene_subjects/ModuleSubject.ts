import {
    CircleGeometry,
    DoubleSide,
    EdgesGeometry,
    Geometry,
    Group,
    Line,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    Scene,
    Vector3,
} from "three";
import {MeshText2D, textAlign} from "three-text2d";
import BRANCH_POINT_UID from "../../../../constants/branchPointUid";
import R from "../../../resources/Namespace";
import {IElementData, ITerminalData} from "../../../storage_engine/models/FirebaseDataModels";
import {getRotationStep, radiansToDegrees} from "../helpers/PhotonEngineHelpers";
import BaseElementSubject from "./BaseElementSubject";
import {SubjectType} from "./BaseSubject";

class ModuleSubject extends BaseElementSubject {

    get isDragable() {
        return true;
    }

    get isSelectable() {
        return true;
    }
    public terminalLabels: Map<string, MeshText2D> = new Map<string, MeshText2D>();

    private leftSidePins = 1;
    private rightSidePins = 1;
    private pinLength = R.layout.modules.pinLength;
    private pin_margin_top = R.layout.modules.pin_margin_top;
    private pin_margin_bottom = R.layout.modules.pin_margin_bottom;
    private pin_to_pin_margin = R.layout.modules.pin_to_pin_margin;

    private objectWidth = R.layout.modules.min_object_width;
    private objectHeight = 0;
    private minObjectHeight = R.layout.modules.min_object_height;

    private clickTargetWidth = 0;
    private clickTargetHeight = 0;

    private containsLongLabel: boolean = false;

    private terminalsAreVisible: boolean = false;

    private boxFrame: LineSegments | null = null;
    private pins: Line[] = [];

    private readonly framePadding: number = R.layout.elements.framePadding;

    // private terminalLabels: Map<string, MeshText2D> = new Map<string, MeshText2D>();

    constructor(scene: Scene, elementData: IElementData) {
        super(scene, elementData);
        this.zLevel = R.layout.z_order.element;

        this.updatedPartVersionData();

        if (this.partVersionData) {
            this.leftSidePins = Math.round(this.partVersionData.terminals.size / 2);
            this.rightSidePins = Math.floor(this.partVersionData.terminals.size / 2);
        }

        this.setObjectHeight();
    }

    public create() {
        return new Promise<string>((resolve) => {
            this.createSymbol();
            resolve();
        });
    }

    public update(time: number) {
        this.setHighlightState();
    }

    public updateFromData(subjectData: IElementData) {
        super.updateFromData(subjectData);
        this.updatedPartVersionData();

        this.updateLabels();
        this.updateTerminalLabels(subjectData);

        this.adjustLabelsbyOrientation();

    }

    public getSize(symbolOnly = false): Vector3 {
        if (symbolOnly) {
            const size = new Vector3();
            if (!this.sceneObject) {
                return size;
            }

            size.x = this.clickTargetWidth;
            size.y = this.clickTargetHeight;

            return size;
        } else {
            return super.getSize();
        }
    }

    public showTerminal(visible: boolean) {

        const self = this;

        const elementData = (this.getSubjectData());
        const orientation = elementData.diagram_position.orientation || 0;
        const orientationInDegrees = Math.round(radiansToDegrees(orientation));
        const normalizedOrientation = Math.abs(orientationInDegrees / radiansToDegrees(getRotationStep()));

        this.terminals.forEach((terminal) => {
            if (!terminal.mesh) {
                return;
            }

            const terminalMeshPosition = new Vector3();
            terminal.mesh.getWorldPosition(terminalMeshPosition);

            const { x, y, z } = terminalMeshPosition;

            if (terminal.terminalLabelMesh && visible) {
                terminal.terminalLabelMesh.position.set(x, y, z);

                if (normalizedOrientation % 4 === 1) {

                    let yOffset;
                    let rotation;

                    terminal.terminalLabelMesh.align = textAlign.left;
                    terminal.terminalLabelMesh.updateText();

                    if (terminal.mesh.position.x < 0) {
                        yOffset = 10;
                        rotation = getRotationStep() / 2;
                    } else {
                        yOffset = -10;
                        rotation = -getRotationStep() / 2;
                    }

                    terminal.terminalLabelMesh.position.set(x, y + yOffset, z);
                    terminal.terminalLabelMesh.rotation.z = rotation;

                } else if (normalizedOrientation % 4 === 3) {

                    let yOffset;
                    let rotation;

                    terminal.terminalLabelMesh.align = textAlign.left;
                    terminal.terminalLabelMesh.updateText();

                    if (terminal.mesh.position.x > 0) {
                        yOffset = 10;
                        rotation = getRotationStep() / 2;
                    } else {
                        yOffset = -10;
                        rotation = -getRotationStep() / 2;
                    }

                    terminal.terminalLabelMesh.position.set(x, y + yOffset, z);
                    terminal.terminalLabelMesh.rotation.z = rotation;

                } else if (normalizedOrientation % 4 === 0) {

                    terminal.terminalLabelMesh.rotation.z = 0;

                    let xOffset;

                    const terminalOnRight = (terminal.mesh.position.x > 0 && !self.isFlipped) ||
                                            (terminal.mesh.position.x < 0 && self.isFlipped);

                    if (terminalOnRight) {
                        xOffset = 10;
                        terminal.terminalLabelMesh.align = textAlign.left;
                        terminal.terminalLabelMesh.updateText();

                    } else {
                        xOffset = -10;
                        terminal.terminalLabelMesh.align = textAlign.right;
                        terminal.terminalLabelMesh.updateText();
                    }

                    terminal.terminalLabelMesh.position.set(x + xOffset, y + 3, z);

                } else if (normalizedOrientation % 4 === 2) {

                    terminal.terminalLabelMesh.rotation.z = 0;

                    let xOffset;

                    const terminalOnRight = (terminal.mesh.position.x < 0 && !self.isFlipped) ||
                                            (terminal.mesh.position.x > 0 && self.isFlipped);

                    if (terminalOnRight) {
                        xOffset = 10;
                        terminal.terminalLabelMesh.align = textAlign.left;
                        terminal.terminalLabelMesh.updateText();

                    } else {
                        xOffset = -10;
                        terminal.terminalLabelMesh.align = textAlign.right;
                        terminal.terminalLabelMesh.updateText();
                    }

                    terminal.terminalLabelMesh.position.set(x + xOffset, y + 3, z);
                }

                self.scene.add(terminal.terminalLabelMesh);

            } else if (terminal.terminalLabelMesh && !visible && this.terminalsAreVisible) {

                self.scene.remove(terminal.terminalLabelMesh);
            }

            const material = terminal.mesh.material as MeshBasicMaterial;
            material.transparent = !visible;

        });

        // This prevents duplicate processing
        if (visible && !this.terminalsAreVisible) {
            this.terminalsAreVisible = true;
        } else if (!visible && this.terminalsAreVisible) {
            this.terminalsAreVisible = false;
        }

    }

    private adjustLabelsbyOrientation() {
        if (!this.primaryLabelMesh || !this.secondaryLabelMesh) {
            return;
        }

        const elementData = (this.getSubjectData());
        const orientation = elementData.diagram_position.orientation || 0;
        const orientationInDegrees = Math.round(radiansToDegrees(orientation));
        const normalizedOrientation = Math.abs(orientationInDegrees / radiansToDegrees(getRotationStep()));

        // alert("Orientation is " + (normalizedOrientation % 4)*90)

        // Position is adjusted based on secondary text
        if (this.secondaryLabelMesh?.text) {
            this.primaryLabelMesh.position.set(0, - this.labelFontSize / 2, R.layout.z_order.element);
            this.secondaryLabelMesh.position.set(0, this.labelFontSize / 2, R.layout.z_order.element);
        } else {
            this.primaryLabelMesh.position.set(0, 0, R.layout.z_order.element);
        }

        if (normalizedOrientation % 4 === 1 || normalizedOrientation % 4 === 3) {

            if (this.containsLongLabel && this.objectWidth > this.objectHeight) {
                this.primaryLabelMesh.rotation.z = getRotationStep();
                this.secondaryLabelMesh.rotation.z = getRotationStep();

                if (this.secondaryLabelMesh?.text) {
                    this.primaryLabelMesh.position.set(this.labelFontSize / 2, 0, R.layout.z_order.element);
                    this.secondaryLabelMesh.position.set(- this.labelFontSize / 2, 0, R.layout.z_order.element);
                }
            }

        } else {
            this.primaryLabelMesh.rotation.z = 0;
            this.secondaryLabelMesh.rotation.z = 0;

        }

    }

    private updateTerminalLabels(subjectData: IElementData) {
        subjectData.part_version_data_cache.terminals.forEach((terminalData) => {
            const terminalLabel = this.terminalLabels.get(terminalData.uid);

            const content = this.getTerminalLabelContent(terminalData);

            if (terminalLabel && content !== terminalLabel.text) {
                terminalLabel.text = content;
                terminalLabel.updateText();
            }
        });
    }

    private setObjectHeight() {
        this.objectHeight = (((this.leftSidePins - 1) * this.pin_to_pin_margin)) +
            (this.pin_margin_top + this.pin_margin_bottom);

        if (this.objectHeight < this.minObjectHeight) {
            this.objectHeight = this.minObjectHeight;
        }
    }

    private setHighlightState() {
        if (this.boxFrame) {
            const boxFrameMaterial = this.boxFrame.material as LineBasicMaterial;
            if (this.selected) {
                boxFrameMaterial.color.set(R.colors.highlighted);
            } else {
                boxFrameMaterial.color.set(R.colors.foreground);
            }
        }

        this.setLabelHighlightState(this.primaryLabelMesh);
        this.setLabelHighlightState(this.secondaryLabelMesh);

        if (this.sceneObject) {
            const self = this;
            this.pins.forEach((pin) => {
                const lineMaterial = (pin as Line).material as LineBasicMaterial;
                if (self.selected) {
                    lineMaterial.color.set(R.colors.highlighted);
                } else {
                    lineMaterial.color.set(R.colors.foreground);
                }
            });
        }
    }

    private createSymbol() {
        this.sceneObject = new Group();

        this.clickTarget = this.createClickTarget();

        // Add click target to scene object group
        this.sceneObject.add(this.clickTarget);

        const subjectFrame = this.createBox();
        this.clickTarget.add(subjectFrame);

        if (this.getSubjectData().part_uid !== BRANCH_POINT_UID) {
            this.primaryLabelMesh = this.createLabel(
                this.getPartNameLabelContent(),
                new Vector3(0, 0, 0), // Position handled by updateLabels() method
                textAlign.bottom,
                R.colors.elements.labels.foreground,
                R.colors.elements.labels.opacity,
            );
            this.sceneObject.add(this.primaryLabelMesh);

            this.secondaryLabelMesh = this.createLabel(
                this.getElementLabelContent(),
                new Vector3(0, this.labelFontSize / 2 , R.layout.z_order.element),
                textAlign.bottom,
                R.colors.elements.labels.foreground,
                R.colors.elements.labels.opacity,
            );
            this.sceneObject.add(this.secondaryLabelMesh);
        }

        // Add click target to scene object group
        this.sceneObject.add(this.clickTarget);

        this.createTerminal();

        this.setMeshNameForDebugging();

        this.scene.add(this.sceneObject);

        // if(self.debugMode){
        //     const debugMesh2 = this.getDebugMesh(self.clickTarget as Mesh);
        //     self.clickTarget?.add(debugMesh2);
        // }

        this.updateFromData(this.getSubjectData() as IElementData);
    }

    private createTerminal() {
        if (!this.sceneObject || !this.partVersionData) {
            return;
        }

        const lineMaterial = new LineBasicMaterial({ color: R.colors.foreground });

        const self = this;
        // TODO@Chris make sure there is no bug involved through creating the index myself
        let index = -1;

        this.partVersionData.terminals.forEach((terminalData: ITerminalData) => {
            index++;
            let xPos = self.objectWidth / 2;
            let yPos = self.objectHeight / 2;
            if (this.getSubjectData().part_uid !== BRANCH_POINT_UID) {
                if (self.sceneObject === null) {
                    return;
                }
                if (index < this.leftSidePins) {
                    xPos = -((self.objectWidth / 2) + self.pinLength);
                    yPos = (self.objectHeight / 2) - (self.pin_margin_top + (index * self.pin_to_pin_margin));
                } else {
                    xPos = ((self.objectWidth / 2));
                    yPos = (self.objectHeight / 2) -
                        (self.pin_margin_top + ((index - this.leftSidePins) * self.pin_to_pin_margin));
                }
                const pin = new Geometry();
                pin.vertices.push(new Vector3(xPos, yPos, self.zLevel));
                pin.vertices.push(new Vector3(xPos + self.pinLength, yPos, self.zLevel));
                const lineMesh = new Line(pin, lineMaterial);
                self.pins.push(lineMesh);
                self.clickTarget?.add(lineMesh);
            } else {
                xPos = 0;
                yPos = 0;
                self.pinLength = 0;
            }

            this.createTerminalClickTarget(index, xPos, yPos, self, terminalData);
        });
    }

    private createTerminalClickTarget(index: number, xPos: number, yPos: number, self: ModuleSubject,
                                      terminalData: ITerminalData) {
        if (!self.sceneObject) {
            return;
        }

        const terminalMesh = this.createTerminalClickTargetMesh();

        if (index >= this.leftSidePins) {
            xPos = xPos + self.pinLength;
        }

        terminalMesh.position.set(xPos, yPos, R.layout.z_order.terminal);

        const terminalLabelMesh = this.createTerminalLabel(terminalData, index, xPos, self, terminalMesh);

        self.clickTarget?.add(terminalMesh);

        self.terminals.push({ mesh: terminalMesh, terminalData, terminalLabelMesh });
    }

    private createTerminalLabel(terminalData: ITerminalData, index: number, xPos: number, self: ModuleSubject,
                                terminalMesh: Mesh) {
        if (terminalData.name) {
            let textAlignment;

            if (index >= this.leftSidePins) {
                xPos = 10;
                textAlignment = textAlign.bottomLeft;
            } else {
                xPos = -10;
                textAlignment = textAlign.bottomRight;
            }

            const content = this.getTerminalLabelContent(terminalData);

            const terminalLabelMesh = this.createLabel(
                content,
                new Vector3(0, 0, self.zLevel),
                textAlignment,
                R.colors.elements.terminals.hoverLabels,
                R.colors.elements.terminals.opacity,
            );
            this.terminalLabels.set(terminalData.uid, terminalLabelMesh);
            terminalLabelMesh.visible = true;
            return terminalLabelMesh;
            // terminalMesh.add(terminalLabelMesh);

        }
    }

    private getTerminalLabelContent(terminalData: ITerminalData) {
        let content = terminalData.name;
        if (terminalData.type) {
            content = content + " (" + terminalData.type + ")";
        }
        return content || "";
    }

    private createClickTarget() {
        if (this.getSubjectData().part_uid === BRANCH_POINT_UID) {
            this.objectWidth = R.layout.branch_point.object_width;
            this.objectHeight = R.layout.branch_point.object_height;
            this.pinLength = 0;
        } else {
            this.clickTargetWidth = this.objectWidth + (2 * this.pinLength) + this.framePadding;
            this.clickTargetHeight = this.objectHeight + 2;
        }

        // const geometry = new PlaneBufferGeometry(this.clickTargetWidth, this.clickTargetHeight, 0);
        const geometry = this.getSubjectData().part_uid === BRANCH_POINT_UID ?
            new CircleGeometry(R.layout.branch_point.radius_md, R.layout.branch_point.segments) :
            new PlaneBufferGeometry(this.clickTargetWidth, this.clickTargetHeight, 0);

        const materialConfig = {
            color: R.colors.debug,
            opacity: 0,
            transparent: true,
            side: DoubleSide,
        };

        if (this.debugMode) {
            materialConfig.opacity = 0.5;
            materialConfig.transparent = false;
        }

        const material = new MeshBasicMaterial(materialConfig);

        const mesh = new Mesh(geometry, material);

        return mesh;
    }

    private createBox() {

        const geometry = new PlaneBufferGeometry(this.objectWidth, this.objectHeight, 32);

        const material = new MeshBasicMaterial({
            color: R.colors.elements.background,
            side: DoubleSide,
        });

        const mesh = new Mesh(geometry, material);

        const geo = this.getSubjectData().part_uid === BRANCH_POINT_UID ?
            new CircleGeometry(R.layout.branch_point.radius_sm, R.layout.branch_point.segments) :
            new EdgesGeometry(mesh.geometry);

        const mat = new LineBasicMaterial({ color: R.colors.elements.foreground, linewidth: 1 });
        this.boxFrame = new LineSegments(geo, mat);
        this.boxFrame.renderOrder = 1; // make sure wireframes are rendered 2nd
        mesh.add(this.boxFrame);

        // The z level of element in accordance with standards defined in resources
        if (this.getSubjectData().part_uid === BRANCH_POINT_UID) {
            mesh.position.set(0, 0, R.layout.z_order.terminal);
        } else {
            mesh.position.set(0, 0, this.zLevel);
        }

        return mesh;
    }

    private getPartNameLabelContent() {
        if (!this.partVersionData) {
            return "";
        }

        if (this.partVersionData.name.length > R.layout.elements.maxLabelCharacters) {
            this.containsLongLabel = true;
            return this.partVersionData.name.substring(0, R.layout.elements.maxLabelCharacters) + "...";
        } else {
            return this.partVersionData.name;
        }
    }

    private getElementLabelContent() {
        if (!this.subjectData) {
            return "";
        }

        const elementData = this.subjectData as IElementData;
        const content = elementData.label || "";

        if (content.length > R.layout.elements.maxLabelCharacters) {
            this.containsLongLabel = true;
            return content.substring(0, R.layout.elements.maxLabelCharacters) + "...";
        } else {
            return content;
        }
    }

    private updateLabels() {
        if (this.sceneObject === null) {
            return;
        }
        if (this.subjectType === SubjectType.Route) {
            return;
        }

        if (this.secondaryLabelMesh) {
            const valueLabelContent = this.getElementLabelContent();
            this.secondaryLabelMesh.text = valueLabelContent;
            this.secondaryLabelMesh.updateText();
        }

        if (this.primaryLabelMesh) {
            const nameLabelContent = this.getPartNameLabelContent();
            this.primaryLabelMesh.text = nameLabelContent;

            this.primaryLabelMesh.updateText();
        }

    }
}

export default ModuleSubject;
