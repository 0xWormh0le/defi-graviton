import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React, {useEffect, useMemo, useState} from "react";
import {dynamicSort, SortOrder} from "../storage_engine/helpers/DynamicSort";
import {IPartData} from "../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../storage_engine/PartStorage";
import PartTableRow from "./PartTableRow";

interface IUserPartsProps {
    profileUser: any;
}

export default function UserParts(props: IUserPartsProps) {
    const { profileUser } = props;
    const [partsState, setPartsState] = useState<IPartData[]>();

    useEffect(() => {
        if (profileUser) {
            const unsubscribe = new PartStorage().listenToUserParts(profileUser.uid, callbackSuccess);
            return () => unsubscribe();
        }

        function callbackSuccess(parts: IPartData[]) {
            setPartsState(parts);
        }
    }, [profileUser]);

    const sortedPartsState = useMemo(() => {
        return partsState ? partsState.sort(dynamicSort("updated_at", SortOrder.desc)) : [];
    }, [partsState]);

    if (partsState) {
        return (
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Updated At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPartsState.map((part: IPartData) => (
                            <PartTableRow part={part} profileUser={profileUser} key={part.uid}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    } else {
        return null;
    }
}
