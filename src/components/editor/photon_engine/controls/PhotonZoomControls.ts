import {Box3, Vector3} from "three";
import R from "../../../resources/Namespace";
import {HotKeysHelper} from "../../keyboard_shortcuts/helpers/HotKeysHelper";
import {getRelativeMousePosition} from "../helpers/PhotonEngineHelpers";
import BaseElementSubject from "../scene_subjects/BaseElementSubject";
import {SubjectType} from "../scene_subjects/BaseSubject";
import SceneManager from "../SceneManager";
import BaseControls from "./BaseControls";
import PhotonNavigationControls from "./PhotonNavigationControls";

export enum ZoomDirection {
    In,
    Out,
}

class PhotonZoomControls extends BaseControls {

    private static setZoomPadding(zoom: number) {
        zoom = zoom * (1 - R.behaviors.zoom_controls.zoomToFitPadding);
        return zoom;
    }

    public orbitControls: any;
    public navigationControls: PhotonNavigationControls;

    constructor(sceneManager: SceneManager) {
        super(sceneManager);
        this.navigationControls = sceneManager.photonNavigationControls;
        this.orbitControls = sceneManager.photonNavigationControls.controls;
    }

    public onMouseWheel(event: WheelEvent) {
        const amount = event.deltaY / 100;
        const zoom = this.camera.zoom - amount;

        if (this.isInZoomRange(zoom)) {
            const {mouseX, mouseY} = getRelativeMousePosition(this.renderer.domElement, event.clientX, event.clientY);

            const mouseXWithAmount = amount > 0 ? 0 : mouseX;
            const mouseYWithAmount = amount > 0 ? 0 : mouseY;

            this.zoomToMousePosition(mouseXWithAmount, mouseYWithAmount, amount, zoom);

            this.throttledStoreViewerState(this.orbitControls.target);
        }

        if (zoom < R.behaviors.zoom_controls.navigation_threshold) {
            this.orbitControls.enabled = false;
        } else {
            this.orbitControls.enabled = true;
        }
    }
    public onKeyUp(event: KeyboardEvent) {
        if (HotKeysHelper.isHotkey(R.keyCommands.zoomToFit.keys, event)) {
            event.preventDefault();
            this.panAndZoomToFit();
        }

        if (HotKeysHelper.isHotkey(R.keyCommands.zoom_in.keys, event)) {
            event.preventDefault();
            this.zoom(ZoomDirection.In);
        }

        if (HotKeysHelper.isHotkey(R.keyCommands.zoom_out.keys, event)) {
            event.preventDefault();
            this.zoom(ZoomDirection.Out);
        }
    }

    public panAndZoomToFit() {
        const selectedElements = this.stateManager
            .getSelectedSubjects()
            .filter((subject) => subject.subjectType === SubjectType.Element);
        const allElementsInScene = this.stateManager.getSubjectsByType(SubjectType.Element);

        if (selectedElements.length > 0) {
            const {position, boundingBox} =
                this.getElementsPositionAndBoundingBox(selectedElements as BaseElementSubject[]);

            this.setPanAndZoom(position, boundingBox);
        } else if (allElementsInScene.length > 0) {
            const {position, boundingBox} =
                this.getElementsPositionAndBoundingBox(allElementsInScene as BaseElementSubject[]);

            this.setPanAndZoom(position, boundingBox);
        } else {
            this.navigationControls.resetState();
        }

        this.storeViewerState(this.orbitControls.target);
    }

    public zoom(zoomDirection: ZoomDirection) {
        if (zoomDirection === ZoomDirection.In) {
            this.SetCameraZoomWithLimits(this.camera.zoom + R.behaviors.zoom_controls.manual_zoom_step);
        } else {
            this.SetCameraZoomWithLimits(this.camera.zoom - R.behaviors.zoom_controls.manual_zoom_step);
        }

        this.camera.updateProjectionMatrix();
        this.storeViewerState(this.orbitControls.target);
    }

    public update(delta: number) {

    }

    protected isInZoomRange(zoom: number) {
        let minZoom = R.behaviors.zoom_controls.minZoom;
        const maxZoom = R.behaviors.zoom_controls.maxZoom;

        const dynamicMinZoom = this.getDynamicMinZoom();

        if (dynamicMinZoom > minZoom) {
            minZoom = dynamicMinZoom * R.behaviors.zoom_controls.minZoomBleed;
        }

        return zoom >= minZoom && zoom <= maxZoom;
    }

    private getDynamicMinZoom() {
        const allElementsInScene = this.stateManager.getSubjectsByType(SubjectType.Element);
        const {boundingBox} =
            this.getElementsPositionAndBoundingBox(allElementsInScene as BaseElementSubject[]);

        return this.getZoomBasedOnBoundingBox(boundingBox);
    }

    private getElementsPositionAndBoundingBox(subjects: BaseElementSubject[]) {
        const {leftBound, rightBound, upperBound, lowerBound, xPosition, yPosition} =
            this.getElementsBoundsAndPosition(subjects);

        const position = new Vector3(xPosition, yPosition, 0);

        const boundingBox = new Box3(
            new Vector3(leftBound, upperBound, 0),
            new Vector3(rightBound, lowerBound, 0),
        );
        return {position, boundingBox};
    }

    private getElementsBoundsAndPosition(subjects: BaseElementSubject[]) {
        const boundsAndPositions = subjects.map((subject) => {
            if (!subject.sceneObject) {
                return null;
            }

            const subjectSize = subject.getSize();

            return {
                x: {
                    max: (subject.sceneObject.position.x + (subjectSize.x / 2)),
                    min: (subject.sceneObject.position.x - (subjectSize.x / 2)),
                    position: subject.sceneObject.position.x,
                },
                y: {
                    max: (subject.sceneObject.position.y + (subjectSize.y / 2)),
                    min: (subject.sceneObject.position.y - (subjectSize.y / 2)),
                    position: subject.sceneObject.position.y,
                },
            };
        }).filter((boundsAndPosition) => boundsAndPosition);

        const xPositions = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.x.position) as number[];
        const yPositions = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.y.position) as number[];

        const minXPosition = Math.min(...xPositions);
        const maxXPosition = Math.max(...xPositions);
        const minYPosition = Math.min(...yPositions);
        const maxYPosition = Math.max(...yPositions);

        let xPosition = minXPosition;
        if (minXPosition !== maxXPosition) {
            xPosition = ((minXPosition - maxXPosition) / 2) + maxXPosition;
        }

        let yPosition = minYPosition;
        if (minYPosition !== maxYPosition) {
            yPosition = ((minYPosition - maxYPosition) / 2) + maxYPosition;
        }

        const minXBounds = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.x.min) as number[];
        const maxXBounds = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.x.max) as number[];

        const minYBounds = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.y.min) as number[];
        const maxYBounds = boundsAndPositions.map((boundsAndPosition) =>
            boundsAndPosition && boundsAndPosition.y.max) as number[];

        const leftBound = Math.min(...minXBounds);
        const rightBound = Math.max(...maxXBounds);

        const upperBound = Math.max(...minYBounds);
        const lowerBound = Math.min(...maxYBounds);

        return {leftBound, rightBound, upperBound, lowerBound, xPosition, yPosition};
    }

    private setPanAndZoom(target: Vector3, boundingBox: Box3) {
        this.camera.position.x = target.x;
        this.camera.position.y = target.y;
        this.camera.position.z = this.getCameraZPosition();

        this.orbitControls.target.x = target.x;
        this.orbitControls.target.y = target.y;
        this.orbitControls.target.z = 0;

        this.zoomToFit(boundingBox);
    }

    private zoomToFit(boundingBox: Box3) {
        let zoom = this.getZoomBasedOnBoundingBox(boundingBox);

        zoom = PhotonZoomControls.setZoomPadding(zoom);

        this.SetCameraZoomWithLimits(zoom);
        this.camera.updateProjectionMatrix();
    }

    private getZoomBasedOnBoundingBox(boundingBox: Box3) {
        let zoom = 0.0;

        const boundingBoxHeight = Math.abs(boundingBox.max.y - boundingBox.min.y);
        const boundingBoxWidth = Math.abs(boundingBox.max.x - boundingBox.min.x);

        if (boundingBoxHeight > boundingBoxWidth) {
            zoom = this.renderer.domElement.clientHeight / boundingBoxHeight;
        } else {
            zoom = this.renderer.domElement.clientWidth / boundingBoxWidth;
        }
        return zoom;
    }

    private SetCameraZoomWithLimits(zoom: number) {
        if (this.isInZoomRange(zoom)) {
            this.camera.zoom = zoom;
        } else if (zoom > R.behaviors.zoom_controls.maxZoom) {
            this.camera.zoom = R.behaviors.zoom_controls.maxZoom;
        } else if (zoom < R.behaviors.zoom_controls.minZoom) {
            this.camera.zoom = R.behaviors.zoom_controls.minZoom;
        }
    }

    private zoomToMousePosition(mouseXWithAmount: number, mouseYWithAmount: number, amount: number, zoom: number) {
        const zoomDirection = new Vector3()
            .set(mouseXWithAmount, mouseYWithAmount, 0.001)
            .unproject(this.camera)
            .sub(this.camera.position)
            .multiplyScalar(amount / zoom);

        this.camera.position.subVectors(this.camera.position, new Vector3(zoomDirection.x, zoomDirection.y, 0));
        this.orbitControls.target.subVectors(
            this.orbitControls.target,
            new Vector3(zoomDirection.x, zoomDirection.y, 0));

        this.SetCameraZoomWithLimits(zoom);
        this.camera.updateProjectionMatrix();
    }
}

export default PhotonZoomControls;
