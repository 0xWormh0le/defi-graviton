import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import React, {useContext} from "react";
import {withRouter} from "react-router-dom";
import AuthContext from "../../AuthContext";
import {CREATE_DOCUMENT} from "../../constants/routes";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {PartStorageHelper} from "../storage_engine/helpers/PartStorageHelper";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

function CreateMenu(props: any) {
    const classes = useStyles();

    const {currentUser} = useContext(AuthContext);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickNewDocument = () => {
        props.history.push(CREATE_DOCUMENT);
    };

    const handleClickNewPartTemplate = () => {
        if (!currentUser) {
            return;
        }

        PartStorageHelper.createNewPartFromTemplate(currentUser, false).then((documentUrl) => {
            props.history.push(documentUrl);
        });
    };

    if (firebaseApp.auth().currentUser?.isAnonymous) {
        return null;
    }

    if (firebaseApp.auth().currentUser) {
        return (
            <>
                <IconButton
                    edge="start"
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="hamburger-menu"
                    aria-controls="hamburger-menu"
                    aria-haspopup="true"
                    onClick={handleMenu}>
                    <AddIcon/>
                </IconButton>
                <Menu
                    id="hamburger-menu"
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
                    <MenuItem onClick={handleClickNewDocument} dense={true}>
                        New Document
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick={handleClickNewPartTemplate} dense={true}>
                        New Part Template
                    </MenuItem>
                </Menu>
            </>
        );
    } else {
        return null;
    }
}

export default withRouter(CreateMenu);
