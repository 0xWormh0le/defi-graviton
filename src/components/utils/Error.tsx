import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React from "react";
import NavBar from "../navigation_bar/NavBar";

export default function Error(props: any) {
    return (
        <>
            <NavBar/>
            <Box width="100%" height="1000px" display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h4" component="h1" gutterBottom>{props.content}</Typography>
            </Box>
        </>
    );
}
