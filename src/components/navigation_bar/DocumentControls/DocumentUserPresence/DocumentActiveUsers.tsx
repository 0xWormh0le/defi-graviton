import Avatar from "@material-ui/core/Avatar";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import Moment from "moment";
import React, {useContext, useEffect, useState} from "react";
import AuthContext from "../../../../AuthContext";
import DocumentContext from "../../../editor/DocumentContext";
import {IUserPresence} from "../../../storage_engine/models/FirebaseDataModels";
import PresentUser from "./PresentUser";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "display": "inline-flex",
            "& > *": {
                margin: theme.spacing(1),
            },
        },
    }),
);

export default function DocumentActiveUsers() {
    const classes = useStyles();

    const amountOfUsersToShow = 4;

    const {documentState} = useContext(DocumentContext);
    const activeUsers = documentState?.active_users;
    const context = useContext(AuthContext);
    const currentUser = context.currentUser;

    const [presentUsers, setPresentUsers] = useState();
    const [presentUsersOverflow, setPresentUsersOverflow] = useState(0);

    useEffect(() => {
        if (activeUsers === undefined || activeUsers.size === 0) {
            return;
        }
        const minutes = 5;
        const users = Array.from(activeUsers.values()).filter((user: IUserPresence) =>
            currentUser && user.user_uid !== currentUser.uid)
            .filter((user: IUserPresence) => {
                return Moment(new Date(user.last_seen)).isAfter(Moment().subtract(minutes, "minutes"));
            });

        const recentlyActiveUsers = users?.sort((a, b) => (a.last_seen > b.last_seen) ? 1 : -1);
        const topFourUsers = recentlyActiveUsers?.slice(0, amountOfUsersToShow);

        setPresentUsers(topFourUsers);

        if (recentlyActiveUsers && recentlyActiveUsers.length > amountOfUsersToShow) {
            setPresentUsersOverflow(recentlyActiveUsers.length - amountOfUsersToShow);
        }
    }, [activeUsers, currentUser]);

    function OverFlow() {
        return (
            <Tooltip title={presentUsersOverflow + " more users"}>
                <Avatar>{"+" + presentUsersOverflow}</Avatar>
            </Tooltip>
        );
    }

    if (presentUsers && presentUsers.length > 0) {
        return (
            <div className={classes.root}>
                <AvatarGroup>
                    {presentUsers.map((user: IUserPresence) => (
                        <PresentUser key={user.user_uid} userUid={user.user_uid}/>
                    ))}
                    {OverFlow}
                </AvatarGroup>
            </div>
        );
    } else {
        return null;
    }
}
