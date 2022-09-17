import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React, {useState} from "react";
import {connectSearchBox} from "react-instantsearch-dom";
import R from "../../resources/Namespace";
import StyledSearchInput from "../../resources/styled_components/styledInputBase";
import {HotKeysHelper} from "../keyboard_shortcuts/helpers/HotKeysHelper";
import {useWindowKeyboardEvent} from "../keyboard_shortcuts/helpers/useWindowKeyboardEvent";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        inputContainer: {
            background: R.colors.parts_browser.searchInputBackground,
            borderColor: R.colors.parts_browser.searchInputBorder,
            margin: theme.spacing(1),
        },
    }),
);

export const PartSearchInput = connectSearchBox(({currentRefinement, refine}) => {
    const classes = useStyles();
    const [inputRef, setInputRef] = useState();

    useWindowKeyboardEvent("keydown", (event) => {
        if (HotKeysHelper.isHotkey(R.keyCommands.search.keys, event as KeyboardEvent)) {
            event.preventDefault();
            inputRef?.focus();
        }
    }, [inputRef]);

    return (
        <StyledSearchInput
            className={classes.inputContainer}
            inputRef={(input) => setInputRef(input)}
            placeholder="Keyword or part number"
            inputProps={{"aria-label": "part-search-input"}}
            value={currentRefinement}
            onChange={(e) => {
                refine(e.target.value);
            }}
        />
    );
});
