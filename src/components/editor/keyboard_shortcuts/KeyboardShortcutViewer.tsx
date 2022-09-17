import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, {useEffect, useState} from "react";
import R from "../../resources/Namespace";
import KeyCommandsSection from "./components/KeyCommandsSection";
import {HotKeysHelper} from "./helpers/HotKeysHelper";
import {useWindowKeyboardEvent} from "./helpers/useWindowKeyboardEvent";

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            position: "absolute",
            width: "80%",
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #000",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
            outline: 0,
            overflowY: "auto",
            height: "80%",
        },
        closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
            float: "right",
        },
    }),
);

export default function KeyboardShortcutViewer() {
    const classes = useStyles();

    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);
    const [inputRef, setInputRef] = useState();

    useWindowKeyboardEvent("keydown", (event) => {
        if (HotKeysHelper.isHotkey(R.keyCommands.open_hotkey_viewer.keys, event as KeyboardEvent)) {
            event.preventDefault();
            handleOpen();
        }
    }, [inputRef]);

    useEffect(() => {
        window.addEventListener("openKeyboardCommandViewer", (event) => {
            event.preventDefault();
            handleOpen();
        });
    }, [inputRef]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={open}
            ref={(input) => setInputRef(input)}
            onClose={handleClose}
        >
            <div style={modalStyle} className={classes.paper}>
                <h2 id="simple-modal-title">{R.strings.hotkey_viewer.title}</h2>
                <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
                    <CloseIcon/>
                </IconButton>
                <KeyCommandsSection keyCommands={HotKeysHelper.getKeyCommands("General")}/>
                <KeyCommandsSection keyCommands={HotKeysHelper.getKeyCommands("Navigation")}/>
                <KeyCommandsSection keyCommands={HotKeysHelper.getKeyCommands("Selection")}/>
                <KeyCommandsSection keyCommands={HotKeysHelper.getKeyCommands("Subject Actions")}/>
                <KeyCommandsSection keyCommands={HotKeysHelper.getKeyCommands("Part Browser")}/>
            </div>
        </Modal>
    );
}
