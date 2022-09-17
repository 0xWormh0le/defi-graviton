export function getRelativeMousePosition(domElement: HTMLCanvasElement, clientX: number, clientY: number) {
    const offsetLeft = domElement.offsetLeft;
    const offsetTop = domElement.offsetTop;
    const clientWidth = domElement.clientWidth;
    const clientHeight = domElement.clientHeight;

    const mouseX = ((clientX - offsetLeft) / clientWidth) * 2 - 1;
    const mouseY = -((clientY - offsetTop) / clientHeight) * 2 + 1;
    return {mouseX, mouseY};
}

export function getRotationStep() {
    return Math.PI / 2;
}

export function radiansToDegrees(radians: number) {
    const degrees = radians * (180 / Math.PI);
    return degrees;
}
