import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import {IKeyCommand} from "../../../resources/KeyCommands";
import {HotKeysHelper} from "../helpers/HotKeysHelper";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        chip: {
            borderRadius: "3px",
            marginRight: "3px",
            fontFamily: "monospace",
        },
        grid: {
            marginBottom: "12px",
        },
        typography: {
            marginTop: "2px",
        },
    }),
);

export default function KeyCommandViewer(props: any) {
    const classes = useStyles();
    const keyCommand = props.keyCommand as IKeyCommand;

    let humanizedCommands;
    if (keyCommand.key_name) {
        humanizedCommands = [keyCommand.key_name];
    }
    if (!humanizedCommands) {
        humanizedCommands = HotKeysHelper.humanizeHotKey(keyCommand.keys);
    }

    function renderKeyCommand(humanizedCommand: string) {
        let keys;
        if (humanizedCommand.length > 1) {
            keys = humanizedCommand.split("+");
        } else {
            keys = [humanizedCommand];
        }

        if (keys.length === 1) {
            return <Chip size="small" label={keys[0].trim()} className={classes.chip}/>;
        } else {
            return <>
                {
                    keys.map((key: string, index) => (
                        <Chip key={index} size="small" label={key.trim()} className={classes.chip}/>
                    ))
                }
            </>;
        }
    }

    return (
        <Grid container className={classes.grid}>
            <Grid item xs={2}>
                {
                    humanizedCommands.map((humanizedCommand: string) => (
                        renderKeyCommand(humanizedCommand)
                    ))
                }
            </Grid>
            <Grid item xs={4}>
                <Typography variant="body2" className={classes.typography}>
                    {keyCommand.description}
                </Typography>
            </Grid>
        </Grid>
    );
}
