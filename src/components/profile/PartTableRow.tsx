import {Button} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import ArchiveIcon from "@material-ui/icons/Archive";
import React, {useEffect, useState} from "react";
import Moment from "react-moment";
import {withRouter} from "react-router-dom";
import {PartStorageHelper} from "../storage_engine/helpers/PartStorageHelper";
import {IPartData, IUserData} from "../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../storage_engine/PartStorage";
import ProfileTableRowLink from "./common/ProfileTableRowLink";

function PartTableRow(props: any) {
    const part = props.part as IPartData;
    const profileUser = props.profileUser as IUserData;

    const [partVersionState, setPartVersionState] = useState();
    const [partUrlState, setPartUrlState] = useState("/");

    useEffect(() => {
        new PartStorage()
            .getPartVersionByPartUidAndVersion(part.uid, part.latest_version)
            .then((partVersion) => {
                setPartVersionState(partVersion);
            });
    }, [part.latest_version, part.uid, partVersionState]);

    useEffect(() => {
        if (profileUser && partVersionState) {
            PartStorageHelper.getRelativeUrl(profileUser, partVersionState, urlCallbackSuccess);
        }

        function urlCallbackSuccess(url: string) {
            setPartUrlState(url);
        }
    }, [partVersionState, profileUser]);

    function handleArchiveDocument() {
        if (partVersionState) {
            new PartStorage().setArchiveStateByPartByUid(partVersionState.part_uid, true);
        }
    }

    if (partVersionState && profileUser && partUrlState) {
        return (
            <TableRow key={partVersionState.uid}>
                <TableCell component="th" scope="row">
                    <Tooltip title={"Open in Editor"}>
                        <div>
                            <ProfileTableRowLink text={partVersionState.name} to={partUrlState} />
                        </div>
                    </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Moment format="D MMM YYYY" withTitle titleFormat="LLLL">
                        {new Date(part.created_at)}
                    </Moment>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Moment format="D MMM YYYY" withTitle titleFormat="LLLL">
                        {new Date(part.updated_at)}
                    </Moment>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Button onClick={handleArchiveDocument}>
                        <Tooltip title={"Archive Part"}>
                            <ArchiveIcon/>
                        </Tooltip>
                    </Button>
                </TableCell>
            </TableRow>
        );
    } else {
        return null;
    }
}

export default withRouter(PartTableRow);
