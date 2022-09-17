import {Divider} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import React, {useContext, useEffect, useState} from "react";
import {DragSourceMonitor, useDrag} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import {PHOTON_ENGINE_CANVAS} from "../../../constants/htmlElementNames";
import {DocumentStorageHelper} from "../../storage_engine/helpers/DocumentStorageHelper";
import {PartStorageHelper} from "../../storage_engine/helpers/PartStorageHelper";
import {IPartVersionData, IUserData, IVector2} from "../../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../../storage_engine/PartStorage";
import {UserStorage} from "../../storage_engine/UserStorage";
import DocumentContext from "../DocumentContext";
import {IDragItem} from "../Editor";
import DragDropItemTypes from "./ItemTypes";
import SkeletonPartListItem from "./SkeletonPartListItem";

const style: React.CSSProperties = {
    cursor: "move",
};

export default function PartListItem(props: any) {
    const partUid = props.partUid;
    const partVersion = props.partVersion || PartStorageHelper.headVersionName;
    const partArchived = props.partArchived;

    const documentContext = useContext(DocumentContext);
    const documentState = documentContext.documentState;
    const setDocumentState = documentContext.setDocumentState;
    const setSelectedSubjectsUids = documentContext.setSelectedSubjectsUids;

    const [loading, setLoading] = React.useState(true);
    const [partVersionDataState, setPartVersionDataState] = useState();
    const [errorState, setErrorState] = React.useState(false);
    const [partVersionOwner, setPartVersionOwner] = React.useState();

    const [{isDragging}, drag, preview] = useDrag({
        item: {partVersionData: partVersionDataState, type: DragDropItemTypes.Part},
        end: (item: IDragItem | undefined, monitor: DragSourceMonitor) => {
            const dropPosition = monitor.getDropResult();

            if (item && dropPosition) {
                addAndSelectPart(item.partVersionData, dropPosition);
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0.4 : 1;

    useEffect(() => {
        preview(getEmptyImage(), {captureDraggingState: true});
    }, [preview]);

    async function addAndSelectPart(partVersionToBeAdded: IPartVersionData, dropPosition: IVector2) {
        const position = PartStorageHelper.createElementPosition(false, dropPosition.x, dropPosition.y);

        const newElement = DocumentStorageHelper.createNewElementData(partVersionToBeAdded, position);

        if (newElement && documentState && setDocumentState && setSelectedSubjectsUids) {
            DocumentStorageHelper.addElement(documentState, newElement);
            setDocumentState(documentState);
            setSelectedSubjectsUids([newElement.uid]);
            document.getElementById(PHOTON_ENGINE_CANVAS)?.focus();

            trackConversion(partVersionToBeAdded);
        }
    }

    async function trackConversion(partVersionToBeAdded: IPartVersionData) {
        props.onAddToCanvas();
        new PartStorage()
            .incrementPartVersionUsageCount(partVersionToBeAdded);
    }

    useEffect(() => {
        if (partUid && partVersion) {
            new PartStorage().getPartVersionByPartUidAndVersion(partUid, partVersion).then((partVersionData) => {
                if (partVersionData) {
                    setPartVersionDataState(partVersionData);

                    new UserStorage().getUserByUid(partVersionData.owner_uid).then((userData: IUserData | null) => {
                        setPartVersionOwner(userData);
                    });

                    setLoading(false);
                } else {
                    setErrorState(true);
                    setLoading(false);
                }
            });
        } else {
            setErrorState(true);
            setLoading(false);
        }
    }, [partUid, partVersion]);

    if (errorState) {
        return (
            <div>Error loading part</div>
        );
    }

    if (loading) {
        return (
            <SkeletonPartListItem/>
        );
    }

    function getSource() {
        const manufacturer = partVersionDataState.properties.get("manufacturer");

        if (partVersionOwner) {
            return (
                <Typography
                    variant="body2"
                    noWrap={true}>
                    Created by {<b>{partVersionOwner.handle}</b>}
                </Typography>
            );
        } else if (manufacturer) {
            return (
                <Typography
                    variant="body2"
                    noWrap={true}>
                    {<b>{manufacturer.value}</b>}
                </Typography>
            );
        } else {
            return null;
        }
    }

    if (partArchived) {
        return null;
    }

    return (
        <div ref={drag} style={{...style, opacity}}>
            <ListItem
                alignItems="flex-start"
                key={partVersionDataState.uid}
                className="partListItem">
                <div className="partPreview">
                    <svg>
                        <image href={PartStorageHelper.getAssetUrl(partVersionDataState)} x="25%" y="25%"/>
                    </svg>
                </div>
                <ListItemText
                    className="partBody"
                    disableTypography={true}
                    primary={
                        <Typography
                            variant="subtitle2">
                            {partVersionDataState.name}
                        </Typography>
                    }
                    secondary={
                        <>
                            <Typography
                                variant="body2"
                                noWrap={true}>
                                {partVersionDataState.description}
                            </Typography>
                            {getSource()}
                        </>
                    }
                />
            </ListItem>
            <Divider component="li"/>
        </div>
    );
}
