import {Geometry, LineBasicMaterial, LineSegments, Object3D, Scene, Vector3} from "three";
import R from "../../../resources/Namespace";
import SceneManager from "../SceneManager";

class GridSubject {
    public object3D = new Object3D();
    private sceneManager: SceneManager;
    private zLevel: number = R.layout.z_order.grid;
    private size = R.layout.grid.size;
    private divisions: number = R.layout.grid.divisions;
    private lastDivisions: number = 0;
    private color = R.colors.grid.Primary;

    constructor(scene: Scene, sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        scene.add(this.object3D);
    }

    get isDragable() {
        return false;
    }

    get isSelectable() {
        return false;
    }

    public update(time: number) {
        const cameraZoomLevel = this.sceneManager.camera.zoom;

        const ranges = [
            {
                min: R.behaviors.zoom_controls.minZoom,
                max: R.behaviors.zoom_controls.maxZoom / 128,
                divisions: this.divisions / 128,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 128,
                max: R.behaviors.zoom_controls.maxZoom / 64,
                divisions: this.divisions / 64,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 64,
                max: R.behaviors.zoom_controls.maxZoom / 32,
                divisions: this.divisions / 32,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 32,
                max: R.behaviors.zoom_controls.maxZoom / 16,
                divisions: this.divisions / 16,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 16,
                max: R.behaviors.zoom_controls.maxZoom / 8,
                divisions: this.divisions / 8,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 8,
                max: R.behaviors.zoom_controls.maxZoom / 4,
                divisions: this.divisions / 4,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 4,
                max: R.behaviors.zoom_controls.maxZoom / 2,
                divisions: this.divisions / 2,
            },
            {
                min: R.behaviors.zoom_controls.maxZoom / 2,
                max: R.behaviors.zoom_controls.maxZoom,
                divisions: this.divisions,
            },
        ];

        ranges.forEach((range) => {
            if (range.min < cameraZoomLevel && range.max > cameraZoomLevel) {
                if (this.lastDivisions !== range.divisions) {
                    this.object3D.children = [];
                    this.object3D.add(this.createGrid(range.divisions));
                    this.lastDivisions = range.divisions;
                }
            }
        });
    }

    private createGrid(divisions: number) {
        const material = new LineBasicMaterial({
            color: this.color,
        });

        const gridObject = new Object3D();

        const geometry = this.createVertices(divisions);

        const line = new LineSegments(geometry, material);
        gridObject.add(line);

        return gridObject;
    }

    private createVertices(divisions: number) {
        const step = 2 * this.size / divisions;

        const geometry = new Geometry();

        // width
        for (let i = -this.size; i <= this.size; i += step) {
            geometry.vertices.push(new Vector3(-this.size, i, this.zLevel));
            geometry.vertices.push(new Vector3(this.size, i, this.zLevel));
        }

        // height
        for (let i = -this.size; i <= this.size; i += step) {
            geometry.vertices.push(new Vector3(i, -this.size, this.zLevel));
            geometry.vertices.push(new Vector3(i, this.size, this.zLevel));
        }

        return geometry;
    }
}

export default GridSubject;
