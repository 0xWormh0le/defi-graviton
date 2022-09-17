import Grid from "@material-ui/core/Grid";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React from "react";
import {useDrop} from "react-dnd";
import {IPartVersionData} from "../storage_engine/models/FirebaseDataModels";
import {setBodyClass, setHtmlRootClass} from "../utils/SetHtmlBodyClass";
import "./Editor.css";
import Inspector from "./inspector/Inspector";
import KeyboardShortcutViewer from "./keyboard_shortcuts/KeyboardShortcutViewer";
import ItemTypes from "./part_browser/ItemTypes";
import PartsBrowser from "./part_browser/PartsBrowser";
import PhotonEngine from "./photon_engine/PhotonEngine";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        Editor: {
            height: "calc(100% - " + theme.spacing(8) + "px)",
        },
    }),
);

export interface IDragItem {
    partVersionData: IPartVersionData;
    type: string;
}

export default function Editor() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{canDrop, isOver}, drop] = useDrop({
        accept: ItemTypes.Part,
        drop(item: IDragItem, monitor) {
            const delta = monitor.getClientOffset() as {
                x: number
                y: number,
            };
            return delta;
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    const classes = useStyles();

    setBodyClass("EditorHtmlRootBody")();
    setHtmlRootClass("EditorHtmlRootBody")();

    return (
        <Grid container spacing={0} wrap="nowrap" className={classes.Editor}>
            <KeyboardShortcutViewer/>
            <PartsBrowser/>
            <Grid item xs ref={drop}>
                <PhotonEngine/>
            </Grid>
            <Inspector/>
        </Grid>
    );
}
