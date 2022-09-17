import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import AccountMenu from "./AccountMenu";
import CreateMenu from "./CreateMenu";
import DocumentActiveUsers from "./DocumentControls/DocumentUserPresence/DocumentActiveUsers";
import NavBarDocumentControls from "./DocumentControls/NavBarDocumentControls";

export default function NavBar() {
    return (
        <AppBar color="inherit" position="relative">
            <Toolbar>
                <CreateMenu/>
                <Box flexGrow={1}>
                    <NavBarDocumentControls/>
                </Box>
                <DocumentActiveUsers/>
                <AccountMenu/>
            </Toolbar>
        </AppBar>
    );
}
