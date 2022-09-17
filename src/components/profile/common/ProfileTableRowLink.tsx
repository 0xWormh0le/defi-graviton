import {Link} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import React from "react";
import {Link as RouterLink} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        link: {
            "display": "block",
            "color": theme.palette.text.primary,
            "&:hover": {
                textDecoration: "underline",
            },
        },
        icon: {
            marginRight: theme.spacing(0.5),
            width: 20,
            height: 20,
        },
    }),
);

export default function ProfileTableRowLink(props: {text: string, to: string}) {
    const classes = useStyles();

    return (
        <Link to={props.to} variant="body2" component={RouterLink}  className={classes.link}>
            <EditIcon className={classes.icon} />
            {props.text}
        </Link>
    );
}
