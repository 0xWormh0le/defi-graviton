import {createMuiTheme, CssBaseline} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import React, {useContext} from "react";
import {Redirect, Route, Router, Switch} from "react-router-dom";
import "./App.css";
import AuthContext from "./AuthContext";
import SignIn from "./components/authentication/SignIn";
import SignUp from "./components/authentication/SignUp";
import {withAuthentication} from "./components/authentication/WithAuthentication";
import {CreateDocument} from "./components/editor/CreateDocument";
import {Document} from "./components/editor/Document";
import NotFound from "./components/NotFound";
import Profile from "./components/profile/Profile";
import R from "./components/resources/Namespace";
import history from "./components/utils/history";
import {CREATE_DOCUMENT, DOCUMENT, LANDING, NOT_FOUND, PROFILE, SIGN_IN, SIGN_UP} from "./constants/routes";

export const reactAppVersion = process.env.REACT_APP_VERSION;

const theme = createMuiTheme({
    palette: {
        type: "dark",
    },
    typography: {
        fontFamily: [
            R.fonts.primary,
            "sans-serif",
        ].join(","),
    },
});

const AppComponent: React.FC = () => {
    setAppVersion();

    const {currentUser} = useContext(AuthContext);

    function setAppVersion() {
        if (reactAppVersion) {
            document.title = "Graviton v" + reactAppVersion;
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router history={history}>
                <Switch>
                    <Route exact path={LANDING}>
                        {currentUser ? <Redirect to={"/" + currentUser.handle}/> : <SignIn/>}
                    </Route>

                    <Route exact path={NOT_FOUND} component={NotFound}/>
                    <Route exact path={SIGN_IN} component={SignIn}/>
                    <Route exact path={SIGN_UP} component={SignUp}/>
                    <Route exact path={CREATE_DOCUMENT} component={CreateDocument}/>
                    <Route exact path={DOCUMENT} component={Document}/>
                    <Route exact path={PROFILE} component={Profile}/>
                    <Redirect to={NOT_FOUND} />
                </Switch>
            </Router>
        </ThemeProvider>
    );
};
export const App = withAuthentication(AppComponent);
