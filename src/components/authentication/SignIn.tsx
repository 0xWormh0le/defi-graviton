import {createStyles, InputLabel, Theme} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Link from "@material-ui/core/Link";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import firebase from "firebase/app";
import {History} from "history";
import queryString from "query-string";
import React, {FormEvent, MouseEvent, useCallback, useState} from "react";
import {LANDING, SIGN_UP} from "../../constants/routes";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {emailIsValid} from "./AuthenticationHelpers";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "& .MuiFormControl-root": {
                margin: theme.spacing(1),
            },
            "& .MuiDivider-root": {
                margin: theme.spacing(1),
            },
            "& .MuiButton-root": {
                margin: theme.spacing(1),
            },
        },
    }),
);

interface ISignInProps {
    history?: History;
    location?: Location;
}

export default function SignIn(props: ISignInProps) {
    const classes = useStyles();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordErrors] = useState<string | null>(null);
    const [emailError, setEmailErrors] = useState<string | null>(null);
    const [error, setErrors] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    let destinationPath = LANDING;

    if (props.location) {
        const values = queryString.parse(props.location.search);

        if (values && values.destinationPath) {
            destinationPath = values.destinationPath.toString();
        }
    }

    const handleFormSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (email && password && !emailError && !passwordError) {
            firebaseApp
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then((result) => {
                    if (result.user) {
                        props.history?.push(destinationPath);
                    }
                })
                .catch((e) => {
                    setErrors(e.message);
                });
        }
    };

    const handleGoogleLogin = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        firebaseApp.auth().signInWithPopup(provider).then((result) => {
            if (result.user) {
                props.history?.push(destinationPath);
            }
        });
    }, [destinationPath, props.history]);

    const handleSetPassword = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const passwordValue = event.target.value;

        if (passwordValue !== "") {
            if (passwordValue && passwordValue.length < 8) {
                setPasswordErrors("Password is too short");
            } else {
                setPasswordErrors(null);
            }
        } else {
            setPasswordErrors(null);
        }

        setPassword(passwordValue);
    };

    const handleSetEmail = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const emailValue = event.target.value;

        if (emailValue !== "") {
            if (!emailIsValid(emailValue)) {
                setEmailErrors("Email is invalid");
            } else {
                setEmailErrors(null);
            }
        } else {
            setEmailErrors(null);
        }

        setEmail(emailValue);
    };

    const handleClickShowPassword = useCallback(() => {
        setShowPassword((prevState) => !prevState);
    }, [setShowPassword]);

    const handleMouseDownPassword = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }, []);

    const isEmailLoginDisabled = !!(emailError || passwordError || !email || !password);

    return (
        <div>
            <Container maxWidth="sm">
                <Paper>
                    <Box marginTop={15} paddingTop={5} padding={10}>
                        <Box paddingBottom={1} margin={1}>
                            <Typography variant="h4" component="h1">Sign in</Typography>
                        </Box>
                        <form onSubmit={handleFormSubmit} className={classes.root} autoComplete="off"
                              noValidate>
                            <TextField
                                id="outlined-basic" label="Email" variant="outlined"
                                value={email}
                                onChange={(event) => handleSetEmail(event)}
                                name="email"
                                type="email"
                                placeholder="Email"
                                fullWidth
                                helperText={emailError}
                                error={!!emailError}
                                autoComplete="on"
                            />
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => handleSetPassword(event)}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <Visibility/> : <VisibilityOff/>}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    labelWidth={0}
                                    fullWidth
                                    required
                                    error={!!passwordError}
                                />
                                <FormHelperText>{passwordError}</FormHelperText>
                            </FormControl>
                            <Divider/>
                            <Button
                                disabled={isEmailLoginDisabled}
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary">
                                Sign in with email
                            </Button>

                            <Button
                                className="googleBtn"
                                type="button"
                                variant="contained"
                                fullWidth
                                onClick={handleGoogleLogin}>
                                Sign in With Google
                            </Button>

                            <span>{error}</span>
                        </form>
                        <Box textAlign="center" paddingTop={1}>
                            <Typography>New around here? <Link color="textSecondary" href={SIGN_UP}>
                                Create an Account.</Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}
