import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import {SortDirection} from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import React, {useMemo} from "react";
import {dynamicSort, SortOrder} from "../storage_engine/helpers/DynamicSort";
import {IDocumentData, IUserData} from "../storage_engine/models/FirebaseDataModels";
import DocumentTableRow from "./DocumentTableRow";
import ProfileDocsPartsTableHead from "./ProfileDocsPartsTableHead";

interface IProfileDocsPartsTable {
    profileUser: IUserData;
    fetchedDocsParts: any;
}

export default function ProfileDocsPartsTable(props: IProfileDocsPartsTable) {
    const { profileUser, fetchedDocsParts } = props;
    const [sortOrder, setSortOrder] = React.useState<SortDirection>("desc");
    const [sortProperty, setSortProperty] = React.useState<keyof IDocumentData>("updated_at");

    const sortedDocsParts = useMemo(() => {
        return fetchedDocsParts ? fetchedDocsParts.sort(
            dynamicSort(sortProperty, (sortOrder === "asc" ? SortOrder.asc : SortOrder.desc))) : [];
    }, [fetchedDocsParts, sortOrder, sortProperty]);

    const sortByPropertyHandler = (property: keyof IDocumentData) => {
        const isAsc = sortProperty === property && sortOrder === "asc";
        setSortOrder(isAsc ? "desc" : "asc");
        setSortProperty(property);
    };

    return (
        <Paper square>
            <TableContainer>
                <Table aria-label="Table listing Docs and Parts">
                    <ProfileDocsPartsTableHead
                        sortDirection={sortOrder}
                        sortProperty={sortProperty}
                        sortByPropertyHandler={sortByPropertyHandler}
                    />
                    <TableBody>
                        {sortedDocsParts.map((document: IDocumentData) => (
                            <DocumentTableRow
                                document={document}
                                profileUser={profileUser}
                                key={document.uid}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
