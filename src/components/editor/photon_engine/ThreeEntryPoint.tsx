import {Stats} from "three-stats";
import {PHOTON_ENGINE_CANVAS} from "../../../constants/htmlElementNames";
import R from "../../resources/Namespace";
import {IDocumentData, IUserData} from "../../storage_engine/models/FirebaseDataModels";
import SceneManager from "./SceneManager";

export default (
    container: HTMLElement | any,
    updateMethod: (documentData: IDocumentData) => void,
    selectedSubjectsMethods: (selectedSubjectsUids: string[]) => void,
    currentUserData: IUserData,
) => {
    const canvas = createCanvas(document, container);
    canvas.tabIndex = 1;
    canvas.id = PHOTON_ENGINE_CANVAS;
    canvas.focus();

    const sceneManager =
        new SceneManager(
            canvas,
            updateMethod,
            selectedSubjectsMethods,
            currentUserData,
        );

    const stats = createStats();

    bindEventListeners();
    resizeCanvas();
    render();

    return sceneManager;

    function createCanvas(document: HTMLDocument, containerHTMLElement: HTMLElement) {
        const htmlCanvasElement = document.createElement("canvas");
        containerHTMLElement.appendChild(htmlCanvasElement);
        return htmlCanvasElement;
    }

    function bindEventListeners() {
        window.onresize = resizeCanvas;
        window.onkeyup = globalKeyUp;
        window.onkeydown = globalKeyDown;
        canvas.onmousemove = mouseMove;
        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;
        canvas.onwheel = mouseWheel;
        canvas.onkeyup = keyUp;
        canvas.onkeydown = keyDown;
        canvas.oncontextmenu = contextMenu;
        canvas.ontouchstart = touchstart;
        canvas.ontouchmove = touchmove;
        canvas.ontouchend = touchend;
    }

    function resizeCanvas() {
        canvas.style.width = "100%";
        canvas.style.height = (window.innerHeight - 65) + "px";
        sceneManager.onWindowResize();
    }

    function mouseWheel(event: WheelEvent) {
        if (event.ctrlKey) {
            event.preventDefault();
        }

        sceneManager.onMouseWheel(event);
    }

    function mouseMove(event: MouseEvent) {
        sceneManager.onMouseMove(event);
    }

    function mouseDown(event: MouseEvent) {
        sceneManager.onMouseDown(event);
    }

    function mouseUp(event: MouseEvent) {
        sceneManager.onMouseUp(event);
    }

    function keyUp(event: KeyboardEvent) {
        sceneManager.onKeyUp(event);
    }

    function keyDown(event: KeyboardEvent) {
        disableNavigateBackOnBackspace(event);
        sceneManager.onKeyDown(event);
    }

    function globalKeyUp(event: KeyboardEvent) {
        disableNavigateBackOnBackspace(event);
        sceneManager.onGlobalKeyUp(event);
    }

    function globalKeyDown(event: KeyboardEvent) {
        disableBrowserPinchZoom(event);
        sceneManager.onGlobalKeyDown(event);
    }

    function touchstart(event: TouchEvent) {
        sceneManager.onTouchstart(event);
    }

    function touchmove(event: TouchEvent) {
        sceneManager.onTouchmove(event);
    }

    function touchend(event: TouchEvent) {
        sceneManager.onTouchend(event);
    }

    function disableBrowserPinchZoom(event: KeyboardEvent) {
        if (event.ctrlKey && (event.code === "61" || event.code === "107" || event.code === "173" || event.code === "109" || event.code === "187" || event.code === "189")) {
            event.preventDefault();
        }
        // 107 Num Key  +
        // 109 Num Key  -
        // 173 Min Key  hyphen/underscor Hey
        // 61 Plus key  +/= key
    }

    function disableNavigateBackOnBackspace(event: KeyboardEvent) {
        if (event.key === "Backspace") {
            event.preventDefault();
        }
    }

    function contextMenu(event: MouseEvent) {
        event.preventDefault();
    }

    function render() {
        if (stats) {stats.begin(); }
        sceneManager.update();
        requestAnimationFrame(render);
        if (stats) {stats.end(); }
    }

    function createStats() {
        if (!R.layout.canvas.showStats) {return; }

        const statsWidget = new Stats();

        document.getElementsByClassName("threeRootElement")[0].appendChild(statsWidget.dom);

        return statsWidget;
    }
};
