import {Button, TableCell, TableRow, Tooltip} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import Moment from "react-moment";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {DocumentStorage} from "../storage_engine/DocumentStorage";
import {DocumentStorageHelper} from "../storage_engine/helpers/DocumentStorageHelper";
import {IDocumentData, IUserData} from "../storage_engine/models/FirebaseDataModels";
import ProfileTableRowLink from "./common/ProfileTableRowLink";

interface IDocumentTableRow extends RouteComponentProps<any> {
    profileUser: IUserData;
    document: IDocumentData;
}

function DocumentTableRow(props: IDocumentTableRow) {
    const { profileUser, document } = props;
    const calendarStrings = {
        lastDay : "LT [Yesterday]",
        sameDay : "LT [Today]",
        lastWeek : "LT [last] dddd",
    };

    function handleDeleteDocument() {
        new DocumentStorage().deleteDocument(document);
    }

    if (document && profileUser) {
        return (
            <TableRow aria-label={document.name}>
                <TableCell component="th" scope="row">
                    <Tooltip title={"Open in Editor"}>
                        <div>
                            <ProfileTableRowLink text={document.name}
                                                 to={DocumentStorageHelper.getRelativeUrl(profileUser, document)} />
                        </div>
                    </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Moment local calendar={calendarStrings} withTitle>
                        {new Date(document.updated_at)}
                    </Moment>
                </TableCell>
                <TableCell component="th" scope="row">
                </TableCell>
                <TableCell component="th" scope="row">
                </TableCell>
                <TableCell component="th" scope="row">
                    <Button onClick={handleDeleteDocument}>
                        <Tooltip title={"Delete Document"}>
                            <DeleteIcon/>
                        </Tooltip>
                    </Button>
                </TableCell>
            </TableRow>
        );
    } else {
        return null;
    }
}

export default withRouter(DocumentTableRow);
