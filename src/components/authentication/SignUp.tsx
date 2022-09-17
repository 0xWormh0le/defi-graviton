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
import React, {FormEvent, MouseEvent, useContext, useState} from "react";
import AuthContext from "../../AuthContext";
import {SIGN_IN} from "../../constants/routes";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {IUserData} from "../storage_engine/models/FirebaseDataModels";
import {UserStorage} from "../storage_engine/UserStorage";
import {emailIsValid, usernameIsValid} from "./AuthenticationHelpers";

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

interface ISignUpProps {
    history: History;
    location: Location;
}

export default function SignUp(props: ISignUpProps) {
    const classes = useStyles();

    const context = useContext(AuthContext);
    const setCurrentUser = context.setCurrentUser;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [userNameError, setUserNameErrors] = useState<string | null>(null);
    const [passwordError, setPasswordErrors] = useState<string | null>(null);
    const [emailError, setEmailErrors] = useState<string | null>(null);
    const [errorState, setErrorState] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    let destinationPath = "";
    let referrer = "";

    if (props.location) {
        const values = queryString.parse(props.location.search);

        if (values) {
            if (values.destinationPath) {
                destinationPath = values.destinationPath.toString();
            }
            if (values.referrer) {
                referrer = values.referrer.toString();
            }
        }
    }

    function redirectPostSignup(user: IUserData) {
        if (destinationPath) {
            props.history.push(destinationPath);
        } else {
            props.history.push(UserStorage.getUserProfileUrl(user));
        }
    }

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (username && email && password && !userNameError && !emailError && !passwordError) {
            if (firebaseApp.auth().currentUser?.isAnonymous) {
                linkAnonUserWithEmailAndPasswordAuth();
            } else {
                doEmailAndPasswordAuth();
            }
        }
    };

    function linkAnonUserWithEmailAndPasswordAuth() {
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);

        firebaseApp.auth().currentUser?.linkWithCredential(credential)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    createUserData(user);
                }
            }, (error) => {
                setErrorState(error.message);
            });
    }

    function doEmailAndPasswordAuth() {
        firebaseApp.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    createUserData(user);
                }
            })
            .catch((error) => {
                setErrorState(error.message);
            });
    }

    const handleGoogleLogin = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (username && !userNameError) {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope("profile");
            provider.addScope("email");

            const anonymousUser = firebase.auth().currentUser;

            firebaseApp.auth().signInWithPopup(provider).then((userCredential) => {
                if (anonymousUser?.isAnonymous && userCredential.credential) {
                    linkAnonUserWithGoogleAuth(anonymousUser, userCredential.credential);
                } else {
                    const user = userCredential.user;
                    if (user) {
                        createUserData(user);
                    }
                }
            });
        }
    };

    function linkAnonUserWithGoogleAuth(anonymousUser: firebase.User, credential: firebase.auth.AuthCredential) {
        anonymousUser.linkWithCredential(credential)
            .then((linkUserCredential: firebase.auth.UserCredential) => {
                const user = linkUserCredential.user;
                if (user) {
                    createUserData(user);
                }
            }, (error: Error) => {
                setErrorState(error.message);
            });
    }

    function createUserData(user: firebase.User) {
        new UserStorage().getOrSetUser(user, username.toLowerCase(), "", referrer).then((userData: IUserData) => {
            if (setCurrentUser) {
                setCurrentUser(userData);
            }
            redirectPostSignup(userData);
        });
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    function handleSetUserName(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const name = event.target.value;

        const minNameLength = 3;

        if (!name) {
            if (name && name.length < minNameLength) {
                setUserNameErrors("Username is too short");
            } else if (!usernameIsValid(name)) {
                setUserNameErrors("Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.");
            } else {
                setUserNameErrors(null);
                checkIfUserNameIsAvailable(name);
            }
        } else {
            setUserNameErrors(null);
        }

        setUsername(name);
    }

    function checkIfUserNameIsAvailable(name: string) {
        new UserStorage().handleExists(name).then((exists: boolean) => {
            if (exists) {
                setUserNameErrors("Username is already taken");
            }
        });
    }

    function handleSetPassword(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const passwordValue = event.target.value;

        const minPasswordLength = 8;

        if (passwordValue !== "") {
            if (passwordValue && passwordValue.length < minPasswordLength) {
                setPasswordErrors("Password is too short");
            } else {
                setPasswordErrors(null);
            }
        } else {
            setPasswordErrors(null);
        }

        setPassword(passwordValue);
    }

    function handleSetEmail(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
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
    }

    function disableEmailSignUpButton() {
        if (userNameError || emailError || passwordError || !username || !email || !password) {
            return true;
        }
        return false;
    }

    function disableGoogleAuthButton() {
        if (userNameError || !username) {
            return true;
        }
        return false;
    }

    return (
        <Container maxWidth="sm">
            <Paper>
                <Box marginTop={15} paddingTop={5} padding={10}>
                    <Box paddingBottom={1} margin={1}>
                        <Typography variant="h4" component="h1">Create your account</Typography>
                    </Box>
                    <form onSubmit={(event) => handleFormSubmit(event)} className={classes.root} autoComplete="off"
                          noValidate>
                        <TextField
                            id="outlined-basic" label="Username" variant="outlined"
                            onChange={(event) => handleSetUserName(event)}
                            name="username"
                            value={username}
                            type="username"
                            placeholder="Username"
                            fullWidth
                            helperText={userNameError}
                            error={!!userNameError}
                            autoComplete="off"
                        />
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
                            disabled={disableEmailSignUpButton()}
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary">
                            Create Account
                        </Button>

                        <Button
                            disabled={disableGoogleAuthButton()}
                            className="googleBtn"
                            type="button"
                            variant="contained"
                            fullWidth
                            onClick={handleGoogleLogin}>
                            Sign up via Google
                        </Button>

                        <span>{errorState}</span>
                    </form>
                    <Box textAlign="center" paddingTop={1}>
                        <Typography>Already have a account? <Link color="textSecondary" href={SIGN_IN}>
                            Sign in here.</Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
