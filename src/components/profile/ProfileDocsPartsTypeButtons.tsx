import {Button, ButtonGroup} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React from "react";
import {DocumentType} from "../storage_engine/DocumentStorage";
import {IFilterDocsPartsHandler} from "./ProfileDocsParts";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typeButton: {
            "&:not(:active)": {
                color: theme.palette.text.secondary,
                fontWeight: "normal",
            },
        },
    }),
);

interface IProfileDocsPartsTypeButtons {
    currentType: number;
    filterDocsPartsHandler: IFilterDocsPartsHandler;
}

export default function ProfileDocsPartsTypeButtons(props: IProfileDocsPartsTypeButtons) {
    const classes = useStyles();
    const {currentType, filterDocsPartsHandler} = props;

    const createFilterHandler = (filterType: DocumentType) => (event: React.MouseEvent<unknown>) => {
        filterDocsPartsHandler(filterType);
    };

    return (
        <ButtonGroup
                     aria-label="buttons filtering docs and parts">
            <Button className={classes.typeButton + (currentType === DocumentType.circuit ? ":active" : "")}
                    variant={currentType === DocumentType.circuit ? "contained" : "outlined"}
                    aria-label="docs filter"
                    color="primary"
                    key={DocumentType.circuit}
                    onClick={createFilterHandler(DocumentType.circuit)}>
                Docs
            </Button>
            <Button className={classes.typeButton + (currentType === DocumentType.part ? ":active" : "")}
                    variant={currentType === DocumentType.part ? "contained" : "outlined"}
                    aria-label="parts filter"
                    color="primary"
                    key={DocumentType.part}
                    onClick={createFilterHandler(DocumentType.part)}>
                Parts
            </Button>
            <Button className={classes.typeButton + (currentType === DocumentType.all ? ":active" : "")}
                    variant={currentType === DocumentType.all ? "contained" : "outlined"}
                    aria-label="all filter"
                    color="primary"
                    key={DocumentType.all}
                    onClick={createFilterHandler(DocumentType.all)}>
                All
            </Button>
        </ButtonGroup>
    );
}
