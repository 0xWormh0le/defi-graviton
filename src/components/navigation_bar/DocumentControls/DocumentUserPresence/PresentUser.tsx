import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Link from "@material-ui/core/Link";
import {createStyles, Theme, withStyles} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import {IUserData} from "../../../storage_engine/models/FirebaseDataModels";
import {UserStorage} from "../../../storage_engine/UserStorage";

const StyledBadge = withStyles((theme: Theme) =>
    createStyles({
        "badge": {
            "backgroundColor": "#44b700",
            "color": "#44b700",
            "boxShadow": `0 0 0 2px ${theme.palette.background.paper}`,
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                animation: "$ripple 1.2s infinite ease-in-out",
                border: "1px solid currentColor",
                content: '""',
            },
        },
        "@keyframes ripple": {
            "0%": {
                transform: "scale(.8)",
                opacity: 1,
            },
            "100%": {
                transform: "scale(2.4)",
                opacity: 0,
            },
        },
    }),
)(Badge);

function PresentUser(props: any) {
    const userUid = props.userUid;
    const [presentUser, setPresentUser] = useState();

    useEffect(() => {
        new UserStorage().getUserByUid(userUid).then((userData: IUserData | null) => {
            setPresentUser(userData);
        });
    }, [userUid]);

    if (presentUser) {
        return (
            <Tooltip title={presentUser.full_name} placement="bottom">
                <StyledBadge
                    overlap="circle"
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    variant="dot"
                >
                    <Link href={UserStorage.getUserProfileUrl(presentUser)} underline="none">
                        <Avatar alt={presentUser.full_name}
                                src={presentUser.picture}>{presentUser.full_name.charAt(0)}</Avatar>
                    </Link>
                </StyledBadge>
            </Tooltip>
        );
    } else {
        return null;
    }
}

export default withRouter(PresentUser);
