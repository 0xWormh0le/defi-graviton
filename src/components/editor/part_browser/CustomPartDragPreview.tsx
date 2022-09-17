import React from "react";
import {useDragLayer, XYCoord} from "react-dnd";
import {PartStorageHelper} from "../../storage_engine/helpers/PartStorageHelper";
import ItemTypes from "./ItemTypes";

const layerStyles: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
    if (!initialOffset || !currentOffset) {
        return {
            display: "none",
        };
    }

    const {x, y} = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

const CustomPartDragPreview: React.FC<any> = () => {
    const {itemType, isDragging, item, initialOffset, currentOffset} =
        useDragLayer((monitor) => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            isDragging: monitor.isDragging(),
        }));

    function renderDragPartPreview() {
        if (itemType === ItemTypes.Part) {
            const imageSize = 60;
            return (
                <svg>
                    <image
                        href={PartStorageHelper.getAssetUrl(item.partVersionData)}
                        width={imageSize}
                        height={imageSize}/>
                </svg>
            );
        }
    }

    if (!isDragging) {
        return null;
    }

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {renderDragPartPreview()}
            </div>
        </div>
    );
};
export default CustomPartDragPreview;
