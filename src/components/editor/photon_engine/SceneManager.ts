import * as THREE from "three";
import {Clock, OrthographicCamera, Raycaster, Scene, Vector3, WebGLRenderer} from "three";
import ThreeCanvasRenderer from "three-canvas-renderer";
import {WEBGL} from "three/examples/jsm/WebGL.js";
import R from "../../resources/Namespace";
import {IUserData, IVector2} from "../../storage_engine/models/FirebaseDataModels";
import PhotonDragControls from "./controls/PhotonDragControls";
import PhotonNavigationControls from "./controls/PhotonNavigationControls";
import PhotonRouteControls from "./controls/PhotonRouteControls";
import PhotonSelectBoxControls from "./controls/PhotonSelectBoxControl";
import PhotonSelectControls from "./controls/PhotonSelectControls";
import PhotonZoomControls from "./controls/PhotonZoomControls";
import {getRelativeMousePosition} from "./helpers/PhotonEngineHelpers";
import BaseSubject from "./scene_subjects/BaseSubject";
import GridSubject from "./scene_subjects/GridSubject";
import SceneStateManager from "./SceneStateManager";

class SceneManager {
    private static webglAvailable() {
        try {
            const canvas = document.createElement("canvas");
            return (
                !!window.WebGLRenderingContext &&
                (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
            );
        } catch (e) {
            return false;
        }
    }

    private static setupRaycaster() {
        const raycaster = new Raycaster();
        raycaster.linePrecision = R.behaviors.select_controls.raycaster_line_precision;

        return raycaster;
    }

    private static buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(R.colors.canvas.background);
        return scene;
    }

    private static buildRenderer(canvas: HTMLCanvasElement) {
        let renderer;

        if (WEBGL.isWebGL2Available()) {
            const context = canvas.getContext("webgl2", {alpha: false});
            if (context) {
                renderer = new THREE.WebGLRenderer({
                    canvas,
                    context,
                    antialias: true,
                    powerPreference: "high-performance",
                });
            }
        }
        if (!renderer) {
            if (SceneManager.webglAvailable()) {
                renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    powerPreference: "high-performance",
                });
            } else {
                renderer = new ThreeCanvasRenderer();
            }
        }
        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;

        return renderer;
    }

    public scene: Scene;
    public renderer: WebGLRenderer;
    public camera: OrthographicCamera;
    public sceneSubjects: BaseSubject[] = [];
    public photonNavigationControls: PhotonNavigationControls;
    public photonDragControls: PhotonDragControls;
    public photonSelectControls: PhotonSelectControls;
    public photonSelectBoxControls: PhotonSelectBoxControls;
    public photonZoomControls: PhotonZoomControls;
    public updateMethod: any;
    public raycaster: Raycaster;
    public stateManager: SceneStateManager;
    public selectedSubjectsMethod: any;
    public canvas: HTMLCanvasElement;

    private clock: Clock = new THREE.Clock();
    private sceneGrid: GridSubject;
    private photonRouteControls: PhotonRouteControls;

    constructor(canvas: HTMLCanvasElement, updateMethod: any, selectedSubjectsMethod: any, currentUserData: IUserData) {
        this.stateManager = new SceneStateManager(this, currentUserData);
        this.canvas = canvas;
        this.scene = SceneManager.buildScene();
        this.renderer = SceneManager.buildRenderer(canvas);
        this.camera = this.buildCamera();
        this.raycaster = SceneManager.setupRaycaster();
        this.sceneGrid = this.createSceneGrid();
        this.photonNavigationControls = new PhotonNavigationControls(this);
        this.photonZoomControls = new PhotonZoomControls(this);
        this.photonDragControls = new PhotonDragControls(this);
        this.photonRouteControls = new PhotonRouteControls(this);
        this.photonSelectControls = new PhotonSelectControls(this);
        this.photonSelectBoxControls = new PhotonSelectBoxControls(this);
        this.updateMethod = updateMethod;
        this.selectedSubjectsMethod = selectedSubjectsMethod;
        THREE.Cache.enabled = true;
    }

    public update() {
        const elapsedTime = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        this.sceneSubjects.forEach((subject) => {
            subject.update(elapsedTime);
        });

        this.renderer.render(this.scene, this.camera);

        this.sceneGrid.update(delta);
        this.photonNavigationControls.update(delta);
        this.photonZoomControls.update(delta);
        this.photonDragControls.update(delta);
        this.photonRouteControls.update(delta);
    }

    public onWindowResize() {
        this.setRendererSize();
        this.camera.left = this.canvas.clientWidth / -2;
        this.camera.right = this.canvas.clientWidth / 2;
        this.camera.top = this.canvas.clientHeight / 2;
        this.camera.bottom = this.canvas.clientHeight / -2;
        this.camera.updateProjectionMatrix();
        this.update();
    }

    public onMouseWheel(event: WheelEvent) {
        this.photonZoomControls.onMouseWheel(event);
    }

    public onMouseMove(event: MouseEvent) {
        this.updateRaycaster(event.clientX, event.clientY);
        this.photonDragControls.onMouseMove(event);
        this.photonSelectControls.onMouseMove(event);
        this.photonSelectBoxControls.onMouseMove(event);
        this.photonRouteControls.onMouseMove(event);
    }

    public onMouseDown(event: MouseEvent) {
        this.photonDragControls.onMouseDown(event);
        this.photonSelectBoxControls.onMouseDown(event);
    }

    public onMouseUp(event: MouseEvent) {
        this.photonDragControls.onMouseUp(event);
        this.photonRouteControls.onMouseUp(event);
        this.photonSelectControls.onMouseUp(event);
        this.photonSelectBoxControls.onMouseUp(event);
    }

    public onKeyDown(event: KeyboardEvent) {
        this.photonSelectControls.onKeyDown(event);
    }

    public onKeyUp(event: KeyboardEvent) {
        this.photonSelectControls.onKeyUp(event);
        this.photonRouteControls.onKeyUp(event);
    }

    public onGlobalKeyDown(event: KeyboardEvent) {

    }

    public onGlobalKeyUp(event: KeyboardEvent) {
        this.photonZoomControls.onKeyUp(event);
    }

    public onTouchstart(event: TouchEvent) {

    }

    public onTouchmove(event: TouchEvent) {

    }

    public onTouchend(event: TouchEvent) {

    }

    public getSceneMousePosition(clientX: number, clientY: number): Vector3 {
        const {mouseX, mouseY} = getRelativeMousePosition(this.renderer.domElement, clientX, clientY);

        const sceneMousePosition = new Vector3();

        sceneMousePosition
            .set(mouseX, mouseY, 0)
            .unproject(this.camera);
        return sceneMousePosition;
    }
    public isPointInsideScreenView(point: IVector2) {
        const frustum = new THREE.Frustum();
        frustum
            .setFromMatrix(new THREE.Matrix4()
                .multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));

        const pos = new THREE.Vector3(point.x, point.y, 0);
        return frustum.containsPoint(pos);
    }

    protected updateRaycaster(clientX: number, clientY: number) {
        const {mouseX, mouseY} = getRelativeMousePosition(this.renderer.domElement, clientX, clientY);

        this.raycaster.setFromCamera({x: mouseX, y: mouseY}, this.camera);
    }

    private setRendererSize() {
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    private buildCamera() {
        return new THREE.OrthographicCamera(
            this.canvas.clientWidth / -2,
            this.canvas.clientWidth / 2,
            this.canvas.clientHeight / 2,
            this.canvas.clientHeight / -2,
            R.behaviors.camera.frustrum.near,
            R.behaviors.camera.frustrum.far,
        );
    }

    private createSceneGrid() {
        return new GridSubject(this.scene, this);
    }
}

export default SceneManager;
