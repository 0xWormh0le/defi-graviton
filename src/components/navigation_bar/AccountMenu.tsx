import {Button} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import React, {useContext} from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import AuthContext from "../../AuthContext";
import {LANDING, SIGN_UP} from "../../constants/routes";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {UserStorage} from "../storage_engine/UserStorage";

function AccountMenu({history}: RouteComponentProps) {
    const context = useContext(AuthContext);
    const currentUser = context.currentUser;

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickProfile = () => {
        if (currentUser) {
            history.push(UserStorage.getUserProfileUrl(currentUser));
        }
    };

    const handleClickKeyboardCommands = () => {
        const event = new Event("openKeyboardCommandViewer");
        window.dispatchEvent(event);
    };

    function signOut() {
        firebaseApp.auth().signOut();
        history.push(LANDING);
    }

    function signUp() {
        const destinationPath = window.location.pathname;
        history.push(SIGN_UP + "?destinationPath=" + destinationPath);
    }

    if (!firebaseApp.auth().currentUser || firebaseApp.auth().currentUser?.isAnonymous) {
        return (
            <Button variant="contained" color="default" onClick={() => signUp()}>Sign up</Button>
        );
    }

    return (
        <>
            <IconButton
                aria-label="account of current user"
                aria-controls="menu-account"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <MoreHorizIcon/>
            </IconButton>
            <Menu
                id="menu-account"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClickProfile} dense={true}>
                    Profile
                </MenuItem>
                <Divider/>
                <MenuItem dense={true}>
                    Settings
                </MenuItem>
                <MenuItem onClick={handleClickKeyboardCommands} dense={true}>
                    Keyboard shortcuts
                </MenuItem>
                <Divider/>
                <MenuItem onClick={() => signOut()} dense={true}>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );

}

export default withRouter(AccountMenu);
