import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import TableCell, {SortDirection} from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import React from "react";
import {IDocumentData} from "../storage_engine/models/FirebaseDataModels";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        profileTableHeadCell: {
            fontSize: "0.75rem",
            fontWeight: "normal",
            color: "#BABABA",
        },
    }),
);

interface IProfileDocsPartsTableHeadCell {
    id?: keyof IDocumentData;
    label: string;
}

const headCells: IProfileDocsPartsTableHeadCell[] = [
    { id: "name", label: "Name" },
    { id: "updated_at", label: "Updated" },
    { label: "Collaborators" },
    { label: "Parts" },
    { label: "Actions" },
];

interface IProfileDocsPartsTableHead {
    sortByPropertyHandler: (property: keyof IDocumentData) => void;
    sortDirection: SortDirection;
    sortProperty: keyof IDocumentData;
}

export default function ProfileDocsPartsTableHead(props: IProfileDocsPartsTableHead) {
    const { sortByPropertyHandler, sortDirection, sortProperty } = props;
    const classes = useStyles();
    const createSortHandler = (property: keyof IDocumentData) => (event: React.MouseEvent<unknown>) => {
        sortByPropertyHandler(property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell, index) => {
                    if (headCell.id) {
                        return <TableCell
                            className={classes.profileTableHeadCell}
                            key={headCell.id}
                            sortDirection={sortProperty === headCell.id ? sortDirection : false}
                        >
                            <TableSortLabel
                                active={sortProperty === headCell.id}
                                direction={sortProperty === headCell.id && sortDirection === "desc" ? "desc" : "asc"}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>;
                    } else {
                        return <TableCell
                            className={classes.profileTableHeadCell}
                            key={index}>{headCell.label}
                        </TableCell>;
                    }
                })}
            </TableRow>
        </TableHead>
    );
}
