import {Geometry, Group, Line, LineBasicMaterial, MeshBasicMaterial, Vector3} from "three";
import R from "../../../resources/Namespace";
import {ISegmentData} from "../../../storage_engine/models/FirebaseDataModels";
import SceneManager from "../SceneManager";
import BaseRouteSubject from "./BaseRouteSubject";
import {SubjectType} from "./BaseSubject";
import RouteSubject from "./RouteSubject";

class SegmentSubject extends BaseRouteSubject {

    protected geometry: Geometry = new Geometry();
    private sceneManager: SceneManager;

    private readonly startPosition: Vector3;
    private readonly endPosition: Vector3;

    get isHorizontal() {
        let isHorizontal = true;
        if (Math.abs(this.endPosition.x - this.startPosition.x) < 0.2) {
            isHorizontal = false;
        }
        return isHorizontal;
    }

    constructor(sceneManager: SceneManager, segmentData: ISegmentData) {
        super(sceneManager.scene, SubjectType.RouteSegment, segmentData);
        this.sceneManager = sceneManager;

        this.startPosition = this.getSubjectData().terminalStartPosition as Vector3;
        this.endPosition = this.getSubjectData().terminalEndPosition as Vector3;

        this.isSelectable = true;
        this.isDragable = true;
        this.createSegment();
    }

    public getPosition(): Vector3 {
        const position = new Vector3();
        if (!this.startPosition || !this.endPosition) {
            return position;
        }

        position.x = (this.startPosition.x + this.endPosition.x) / 2;
        position.y = (this.startPosition.y + this.endPosition.y) / 2;
        position.z = this.zLevel;

        return position;
    }

    public isWithinBounds(min: Vector3, max: Vector3, symbolOnly = false) {
        /* Checks if segment inside the rectangle defined by `min` and `max`
         * Select the segment if it is inside
        */
        let collisionDetected = false;
        if (this.isHorizontal) {
            if (min.y > this.startPosition.y && this.startPosition.y > max.y) {
                if ((this.startPosition.x - min.x) * (this.endPosition.x - min.x) < 0 ||
                    (this.startPosition.x - max.x) * (this.endPosition.x - max.x) < 0) {
                    collisionDetected = true;
                } else if ((min.x < this.endPosition.x) && (min.x < this.startPosition.x) &&
                    (this.endPosition.x < max.x) && (this.startPosition.x < max.x)) {
                    collisionDetected = true;
                }
            }
        } else if (min.x < this.startPosition.x && this.startPosition.x < max.x) {
            if ((this.startPosition.y - min.y) * (this.endPosition.y - min.y) < 0 ||
                (this.startPosition.y - max.y) * (this.endPosition.y - max.y) < 0) {
                collisionDetected = true;
            } else if ((min.y > this.endPosition.y) && (min.y > this.startPosition.y) &&
                (this.endPosition.y > max.y) && (this.startPosition.y > max.y)) {
                collisionDetected = true;
            }
        }

        return collisionDetected;
    }

    public update(time: number) {
        this.geometry.verticesNeedUpdate = true;

        this.geometry.computeBoundingSphere();

        this.setHighlightState();
    }

    public updatePosition(position: Vector3) {
        const parent = this.sceneManager
            .stateManager
            .findSubjectByUid((this.getSubjectData()).route_uid) as RouteSubject;
        parent.canAutoRoute = false;
        if (this.isHorizontal) {
            this.startPosition.y = position.y;
            this.endPosition.y = position.y;
        } else {
            this.startPosition.x = position.x;
            this.endPosition.x = position.x;
        }
    }

    public getSubjectData() {
        return super.getSubjectData() as ISegmentData;
    }

    private setHighlightState() {
        if (!this.sceneObject || !this.clickTarget) {
            return;
        }

        const line = this.clickTarget as Line;
        const material = line.material as MeshBasicMaterial;

        if (this.selected) {
            material.color.set(R.colors.highlighted);
        } else {
            material.color.set(R.colors.routes.foreground);
        }
    }

    private createSegment() {
        const material = new LineBasicMaterial({
            color: R.colors.routes.foreground,
            linewidth: R.layout.routes.route_width,
        });

        this.geometry.vertices.push(this.startPosition);
        this.geometry.vertices.push(this.endPosition);

        this.sceneObject = new Group();
        this.clickTarget = new Line(this.geometry, material);

        this.sceneObject.add(this.clickTarget);

        this.scene.add(this.sceneObject);
    }
}

export default SegmentSubject;
