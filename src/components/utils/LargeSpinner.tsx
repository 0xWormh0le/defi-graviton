import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import React from "react";

export default function LargeSpinner(props: any) {
    return (
        <Box width="100%" height="1000px" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress/>
            <Typography variant="h4" component="h1" gutterBottom>{props.content}</Typography>
        </Box>
    );
}
