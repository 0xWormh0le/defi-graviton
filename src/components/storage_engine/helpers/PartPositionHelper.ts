import { IVector2 } from "../models/FirebaseDataModels";

const directionMapping = {
    left: 0,
    up: Math.PI / 2,
    right: Math.PI,
    down: -Math.PI / 2,
};

interface IPartOrientation {
    isHorizontal: boolean;
    orientationRad: number;
    orientationDeg?: number;
}

class PartPositionHelper {
    // As part symbols were decided to be created with 32 by 32 grid, terminal is offseted by grid size
    private newTerminalOffet = 32;

    public getNewElementTerminalPosition(elementPosition: IVector2, rawTerminalPostion: IVector2): IVector2 {
        const terminalPostion = this.getRotatedTerminalPosition(elementPosition, rawTerminalPostion);

        const { isHorizontal, orientationRad } = this.getTerminalOrientation(terminalPostion);

        const offsetPossition: IVector2 = {
            x: Math.sign(terminalPostion.x) * (Math.abs(terminalPostion.x) + this.newTerminalOffet),
            y: Math.sign(terminalPostion.y) * (Math.abs(terminalPostion.y) + this.newTerminalOffet),
        };

        return {
            x: isHorizontal ? elementPosition.x + offsetPossition.x : elementPosition.x + terminalPostion.x,
            y: !isHorizontal ? elementPosition.y + offsetPossition.y : elementPosition.y + terminalPostion.y,
            orientation: orientationRad,
        };
    }

    private getTerminalOrientation(terminalPostion: IVector2): IPartOrientation {
        const isHorizontal = Math.abs(terminalPostion.x) >= Math.abs(terminalPostion.y);
        let orientationRad;

        if (isHorizontal) {
            orientationRad = terminalPostion.x >= 0
                ? directionMapping.right
                : directionMapping.left;
        } else {
            orientationRad = terminalPostion.y >= 0
                ? directionMapping.down
                : directionMapping.up;
        }

        return { isHorizontal, orientationRad };
    }

    private getRotatedTerminalPosition(elementPosition: IVector2, terminalPostion: IVector2): IVector2 {
        const sin = Math.sin(elementPosition?.orientation ?? 0);
        const cos = Math.cos(elementPosition?.orientation ?? 0);

        return {
            x: terminalPostion.x * cos - terminalPostion.y * sin,
            y: terminalPostion.x * sin + terminalPostion.y * cos,
        };
    }
}

export default new PartPositionHelper();
