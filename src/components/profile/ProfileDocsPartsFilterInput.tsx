import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React, {useEffect, useState} from "react";
import {HotKeysHelper} from "../editor/keyboard_shortcuts/helpers/HotKeysHelper";
import R from "../resources/Namespace";
import StyledSearchInput from "../resources/styled_components/styledInputBase";
import {IFilterDocsPartsHandler} from "./ProfileDocsParts";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        inputContainer: {
            background: R.colors.profile.searchInputBackground,
            borderColor: R.colors.profile.searchInputBorder,
            marginRight: theme.spacing(3),
        },
    }),
);

interface IProfileDocsPartsFilterInput {
    currentQuery: string;
    filterDocsPartsHandler: IFilterDocsPartsHandler;
}

export default function ProfileDocsPartsFilterInput(props: IProfileDocsPartsFilterInput) {
    const classes = useStyles();
    const {currentQuery, filterDocsPartsHandler} = props;
    const [inputRef, setInputRef] = useState();

    useEffect(() => {
        window.addEventListener("keydown", (event) => {
            if (HotKeysHelper.isHotkey(R.keyCommands.search.keys, event)) {
                event.preventDefault();
                inputRef?.focus();
            }
        });
    }, [inputRef, currentQuery]);

    return (
        <StyledSearchInput
            className={classes.inputContainer}
            inputRef={(input) => setInputRef(input)}
            placeholder={R.strings.profile.inputQueryPlaceholder}
            value={currentQuery}
            onChange={(e) => {
                filterDocsPartsHandler(undefined, e.target.value);
            }}
        />
    );
}
