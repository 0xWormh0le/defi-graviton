
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import {LANDING} from "../constants/routes";

const useStyles = makeStyles((theme) => ({
    box: {
        textAlign: "center",
    },
    link: {
        marginTop: theme.spacing(2),
        color: "#eee",
    },
}));

export default function NotFound() {
    const classes = useStyles();
    return (
        <div>
            <Container maxWidth="sm">
                <Paper>
                    <Box marginTop={15} padding={5} className={classes.box}>
                        <Typography component="h1" variant="h4">Page not found</Typography>
                        <Typography variant="h6">
                            <Link className={classes.link} href={LANDING}>Go to homepage</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}
