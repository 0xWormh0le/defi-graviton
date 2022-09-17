import {createStyles, Theme} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
    }),
);

export default function ButtonInput(props: any) {
    const classes = useStyles();

    const label = props.label;
    const onClick = props.onClick;

    return (
        <Button
            className={classes.margin}
            variant="contained"
            fullWidth={true}
            size="small"
            onClick={onClick}>
            {label}
        </Button>
    );
}
