import {Geometry, Line, LineBasicMaterial, MeshBasicMaterial, Vector3} from "three";
import BRANCH_POINT_UID from "../../../../constants/branchPointUid";
import R from "../../../resources/Namespace";
import {DocumentStorageHelper} from "../../../storage_engine/helpers/DocumentStorageHelper";
import {IRouteData, IVector3} from "../../../storage_engine/models/FirebaseDataModels";
import SceneManager from "../SceneManager";
import BaseElementSubject from "./BaseElementSubject";
import BaseRouteSubject from "./BaseRouteSubject";
import {ITerminal, SubjectType} from "./BaseSubject";
import SegmentSubject from "./SegmentSubject";

export enum TerminalIndex {
    start = "0",
    end = "1",
}

class RouteSubject extends BaseRouteSubject {

    get isSelectable() {
        return true;
    }

    get length() {
        return this.vertices.length;
    }
    get canAutoRoute() {
        return (this.subjectData as IRouteData).canAutoRoute;
    }

    set canAutoRoute(value) {
        (this.subjectData as IRouteData).canAutoRoute = value;
    }

    get isSelected() {
        let selected = false;
        this.segments.forEach((segment) => {
            selected = selected || segment.isSelected;
        });
        return selected;
    }

    get elementA() {
        return this._elementA;
    }

    get elementB() {
        return this._elementB;
    }

    get terminalA() {
        return this._terminalA;
    }

    get terminalB() {
        return this._terminalB;
    }

    private readonly sceneManager: SceneManager;
    private geometry: Geometry = new Geometry();
    private _terminalA: ITerminal | undefined = undefined;
    private _terminalB: ITerminal | undefined = undefined;
    private _elementA: BaseElementSubject | undefined = undefined;
    private _elementB: BaseElementSubject | undefined = undefined;
    private terminalAPosition: Vector3 = new Vector3();
    private terminalBPosition: Vector3 = new Vector3();

    private vertices: Vector3[] = [];
    private segments: SegmentSubject[] = [];

    constructor(sceneManager: SceneManager, routeData: IRouteData) {
        super(sceneManager.scene, SubjectType.Route, routeData);

        this.zLevel = R.layout.z_order.route;
        this.sceneManager = sceneManager;

        this.setupRoute();
        this.loadVertices();
        this.createLineMesh();
    }

    public getSegments() {
        return this.segments;
    }

    public updateFromData(subjectData: IRouteData) {
        super.updateFromData(subjectData);

        this.updateMiddleVertices();
        this.setupRoute();
    }

    public update(time: number) {
        this.updateLineGeometry();

        this.setHighlightState();
    }

    public getSubjectData() {
        return super.getSubjectData() as IRouteData;
    }

    private updateMiddleVertices() {
        const middleVertices = this.getMiddleVerticesFromSubjectData();

        middleVertices.forEach((middleVertice, index) => {
            const vertice = this.vertices[index + 1];
            vertice.x = middleVertice.x;
            vertice.y = middleVertice.y;
            vertice.z = middleVertice.z;
        });
    }

    private loadVertices() {
        this.vertices.push(this.terminalAPosition);

        const middleVertices = this.getMiddleVerticesFromSubjectData();

        middleVertices.forEach((vector3: IVector3) => {
            this.vertices.push(new Vector3(vector3.x, vector3.y, vector3.z));
        });

        this.vertices.push(this.terminalBPosition);
    }

    private setupRoute() {
        this.populateConnectedElements();
        this.populateTerminals();
    }

    private getStartEndpointTerminal() {
        const terminalUid = this.getSubjectData().endpoints.start_element_terminal.terminal_uid;
        return this._elementA?.getTerminal(terminalUid) as ITerminal;
    }

    private getEndEndpointTerminal() {
        const terminalUid = this.getSubjectData().endpoints.end_element_terminal.terminal_uid;
        return this._elementB?.getTerminal(terminalUid) as ITerminal;
    }

    private getStartEndpointElement() {
        const element = this.sceneManager
            .stateManager
            .findSubjectByUid(
                this.getSubjectData().endpoints.start_element_terminal.element_uid) as BaseElementSubject;

        if (element) {
            return element;
        } else {
            console.error("Error fetching Route Endpoint Element");
        }
    }

    private getEndEndpointElement() {
        const element = this.sceneManager
            .stateManager
            .findSubjectByUid(
                this.getSubjectData().endpoints.end_element_terminal.element_uid) as BaseElementSubject;

        if (element) {
            return element;
        } else {
            console.error("Error fetching Route Endpoint Element");
        }
    }

    private setHighlightState() {
        if (!this.sceneObject) {
            return;
        }

        const line = this.sceneObject as Line;
        const material = line.material as MeshBasicMaterial;

        if (this.selected) {
            material.color.set(R.colors.highlighted);
        } else {
            material.color.set(R.colors.routes.foreground);
        }
    }

    private createLineMesh() {
        const material = new LineBasicMaterial({
            color: R.colors.routes.foreground,
            linewidth: R.layout.routes.route_width,
        });

        this.createSegments();

        this.sceneObject = new Line(this.geometry, material);
        this.updateLineGeometry();
        this.scene.add(this.sceneObject as Line);
    }

    private createSegments() {
        this.vertices.forEach((vertice, index) => {
            const nextVertice = this.vertices[index + 1] || this.terminalBPosition;

            const segment = DocumentStorageHelper
                .createNewSegment(this.subjectUid, vertice, nextVertice);

            const segmentSubject = new SegmentSubject(this.sceneManager, segment);

            if (vertice === this.terminalAPosition || vertice === this.terminalBPosition) {
                segmentSubject.isDragable = false;
            }
            this.segments.push(segmentSubject);
            this.sceneManager.sceneSubjects.push(segmentSubject);
        });
    }

    private updateLineGeometry() {
        if (this.sceneObject && this._terminalA && this._terminalB) {
            this.updateTerminalPositions();

            this.vertices[0].x = this.terminalAPosition.x;
            this.vertices[0].y = this.terminalAPosition.y;

            this.vertices[this.length - 1].x = this.terminalBPosition.x;
            this.vertices[this.length - 1].y = this.terminalBPosition.y;

            if (this.canAutoRoute) {
                this.vertices[1].x = this.vertices[0].x;
                this.vertices[1].y = this.vertices[0].y;

                this.vertices[2].x = this.vertices[0].x;
                this.vertices[2].y = (this.vertices[0].y + this.vertices[this.length - 1].y) / 2;

                this.vertices[3].x = this.vertices[this.length - 1].x;
                this.vertices[3].y = (this.vertices[0].y + this.vertices[this.length - 1].y) / 2;

                this.vertices[this.length - 2].x = this.vertices[this.length - 1].x;
                this.vertices[this.length - 2].y = this.vertices[this.length - 1].y;
            } else {
                // If route is linked to branch point
                if (this.elementA?.partVersionData?.part_uid === BRANCH_POINT_UID ||
                    this.elementB?.partVersionData?.part_uid === BRANCH_POINT_UID) {
                    if (this.vertices[3].y === this.vertices[4].y) {
                        // branch point is located on horizontal segment
                        this.vertices[1].x = this.vertices[0].x;
                        this.vertices[2].y = this.vertices[1].y;
                        this.vertices[3].x = this.vertices[2].x;
                        this.vertices[4].x = this.vertices[5].x;
                        this.vertices[4].y = this.vertices[3].y;
                    } else {
                        this.vertices[1].y = this.vertices[0].y;
                        this.vertices[2].x = this.vertices[1].x;
                        this.vertices[3].y = this.vertices[2].y;
                        this.vertices[4].y = this.vertices[5].y;
                        this.vertices[4].x = this.vertices[3].x;
                    }
                } else {
                    this.vertices[1].y = this.vertices[0].y;
                    this.vertices[2].x = this.vertices[1].x;
                    this.vertices[3].y = this.vertices[2].y;
                    this.vertices[4].x = this.vertices[3].x;

                    this.vertices[this.length - 2].y = this.vertices[this.length - 1].y;
                    this.vertices[this.length - 3].x = this.vertices[this.length - 2].x;
                }
            }
            this.geometry.verticesNeedUpdate = true;
            this.geometry.computeBoundingSphere();
            this.updateMiddleVerticesData();
        }
    }

    private updateMiddleVerticesData() {
        const vertices = this.getMiddleVerticesFromSubjectData();

        this.vertices
            .filter((vertice) => vertice !== this.terminalAPosition && vertice !== this.terminalBPosition)
            .forEach((vertice: Vector3, index) => {
                vertices[index].x = vertice.x;
                vertices[index].y = vertice.y;
                vertices[index].z = vertice.z;
            });
    }

    private getMiddleVerticesFromSubjectData() {
        return Array
            .from(this.getSubjectData().middleVertices.values())
            .sort((a, b) => (a.index > b.index) ? 1 : -1);
    }

    private populateConnectedElements() {
        this._elementA = this.getStartEndpointElement();
        this._elementB = this.getEndEndpointElement();
    }

    private updateTerminalPositions() {
        if (!this._terminalA || !this._terminalB) {
            return;
        }

        this._terminalA.mesh.getWorldPosition(this.terminalAPosition);
        this._terminalB.mesh.getWorldPosition(this.terminalBPosition);
    }

    private populateTerminals() {
        this._terminalA = this.getStartEndpointTerminal();
        this._terminalB = this.getEndEndpointTerminal();
    }
}

export default RouteSubject;
