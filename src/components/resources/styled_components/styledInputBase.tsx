import {InputLabel} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import InputBase from "@material-ui/core/InputBase";
import {InputBaseProps} from "@material-ui/core/InputBase/InputBase";
import {createStyles, Theme, withStyles} from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import clsx from "clsx";
import React from "react";

const StyledBox = withStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "inline-flex",
            width: theme.spacing(32.5),
            height: theme.spacing(4.75),
            border: "1px solid",
            boxSizing: "border-box",
            verticalAlign: "top",
        },
    }),
)(Box);

const StyledInputBase = withStyles((theme: Theme) =>
    createStyles({
        root: {
            fontSize: theme.typography.fontSize,
            lineHeight: theme.typography.fontSize * 1.35,
            paddingLeft: theme.spacing(0.75),
            paddingRight: theme.spacing(1),
            width: "inherit",
        },
        input: {
            paddingLeft: theme.spacing(0.5),
        },
    }),
)(InputBase);

export default function StyledSearchInput(props: InputBaseProps) {
    let {inputProps} = props;
    const {classes, className, ...other} = props;
    if (inputProps !== undefined) {
        if (inputProps["aria-label"] === undefined) {
            inputProps["aria-label"] = "search-input";
        }
    } else {
        inputProps = {"aria-label": "search-input"};
    }

    return (
        <StyledBox className={clsx(classes ? classes.root : undefined, className)}>
            <InputLabel htmlFor="search-input" style={{display: "none"}}>Search Input</InputLabel>
            <StyledInputBase
                id="search-input"
                type="search"
                fullWidth={true}
                startAdornment={(
                    <SearchIcon />
                )}
                inputProps={inputProps}
                {...other}
            />
        </StyledBox>
    );
}
