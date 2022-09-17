import BaseSubject from "./BaseSubject";

class BaseRouteSubject extends BaseSubject {
    get isSelectable() {
        return this.selectable;
    }

    set isSelectable(value: boolean) {
        this.selectable = value;
    }

    get isDragable() {
        return this.dragable;
    }

    set isDragable(value: boolean) {
        this.dragable = value;
    }

    private selectable = false;
    private dragable = false;
}

export default BaseRouteSubject;
