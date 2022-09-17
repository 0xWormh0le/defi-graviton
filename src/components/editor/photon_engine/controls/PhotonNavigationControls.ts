import {MOUSE, TOUCH} from "three";
import OrbitControls from "three-orbitcontrols";
import R from "../../../resources/Namespace";
import {IVector3} from "../../../storage_engine/models/FirebaseDataModels";
import {HotKeysHelper} from "../../keyboard_shortcuts/helpers/HotKeysHelper";
import SceneManager from "../SceneManager";
import BaseControls from "./BaseControls";

class PhotonNavigationControls extends BaseControls {
    public controls: any;

    constructor(sceneManager: SceneManager) {
        super(sceneManager);

        this.controls = this.buildControls();

        this.loadStateFromDocument();
    }

    public loadStateFromDocument() {
        const zoom = this.stateManager.findDocumentProperty("zoom", "viewer_state");
        const cameraPosition = this.stateManager.findDocumentProperty("camera_position", "viewer_state");
        const navigationControlsTarget = this.stateManager.findDocumentProperty("navigation_controls_target", "viewer_state");

        if (cameraPosition && zoom && navigationControlsTarget) {
            const cameraPositionValue = cameraPosition.value as IVector3;
            const navigationControlsTargetValue = navigationControlsTarget.value as IVector3;

            this.camera.position.x = cameraPositionValue.x;
            this.camera.position.y = cameraPositionValue.y;
            this.camera.position.z = cameraPositionValue.z;

            this.controls.target.x = navigationControlsTargetValue.x;
            this.controls.target.y = navigationControlsTargetValue.y;
            this.controls.target.z = navigationControlsTargetValue.z;

            this.camera.zoom = zoom.value as number;
            this.camera.updateProjectionMatrix();
        } else {
            this.resetState();
        }
    }

    public resetState() {
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = this.getCameraZPosition();

        this.controls.target.x = 0;
        this.controls.target.y = 0;
        this.controls.target.z = 0;

        this.camera.zoom = R.behaviors.zoom_controls.default_zoom;
        this.camera.updateProjectionMatrix();
    }

    public update(delta: number) {
        if (!this.enabled) {
            return;
        }

        this.controls.update(delta);
    }

    private buildControls() {
        const localControls = new OrbitControls(this.camera, this.renderer.domElement);

        const self = this;

        localControls.enableRotate = false;
        localControls.enableZoom = false;
        localControls.enablePan = true;
        localControls.screenSpacePanning = true;
        localControls.mouseButtons = {RIGHT: MOUSE.PAN};
        localControls.touches = {TWO: TOUCH.PAN};
        localControls.keyPanSpeed = R.behaviors.navigation_controls.keySpanSpeed;
        localControls.enableDamping = true;
        localControls.dampingFactor = R.behaviors.navigation_controls.dampingFactor;
        localControls.keys = {
            LEFT: HotKeysHelper.getKeyCode(R.keyCommands.navigate_left.keys),
            UP: HotKeysHelper.getKeyCode(R.keyCommands.navigate_up.keys),
            RIGHT: HotKeysHelper.getKeyCode(R.keyCommands.navigate_right.keys),
            BOTTOM: HotKeysHelper.getKeyCode(R.keyCommands.navigate_down.keys),
        };
        localControls.addEventListener("end", () => {
            self.onPositionChanged();
        });

        return localControls;
    }

    private onPositionChanged() {
        this.throttledStoreViewerState(this.controls.target);
    }
}

export default PhotonNavigationControls;
