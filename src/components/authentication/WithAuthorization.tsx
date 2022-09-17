import {Unsubscribe} from "firebase";
import {History} from "history";
import React, {useContext, useEffect, useRef} from "react";
import {withRouter} from "react-router-dom";

import AuthContext, {AuthContextConsumer} from "../../AuthContext";
import {SIGN_IN} from "../../constants/routes";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {IUserData} from "../storage_engine/models/FirebaseDataModels";
import {UserStorage} from "../storage_engine/UserStorage";
import LargeSpinner from "../utils/LargeSpinner";

interface IProps {
    history: History;
}

type ICondition = (firebaseUser: firebase.User | null) => boolean;

export const withAuthorization = (condition: ICondition) => (Component: React.ComponentType) => {
    function WithAuthorization(props: IProps) {
        const authContext: any = useContext(AuthContext);
        const unsubscribeRef: React.MutableRefObject<Unsubscribe | null> = useRef(null);

        useEffect(() => {
            unsubscribeRef.current = firebaseApp.auth().onAuthStateChanged((firebaseAuthUser: firebase.User | null) => {
                if (!condition(firebaseAuthUser)) {
                    const destinationPath = window.location.pathname;
                    props.history.push(SIGN_IN + "?destinationPath=" + destinationPath);
                } else if (!firebaseAuthUser) {
                    firebaseApp.auth().signInAnonymously().then((userCredential: firebase.auth.UserCredential) => {
                        const {displayName, handle} = UserStorage.generateAnonUserName();
                        if (userCredential.user) {
                            new UserStorage().getOrSetUser(userCredential.user, handle, displayName)
                                .then((user: IUserData) => {
                                    authContext.setCurrentUser(user);
                                });
                        }
                    });
                }
            });

            return () => {
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                }
            };
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        if (!firebaseApp.auth().currentUser) {
            return (
                <LargeSpinner content="Authenticating..."/>
            );
        } else {
            return (
                <AuthContextConsumer>
                    {(authUser) => (authUser ? <Component/> : null)}
                </AuthContextConsumer>
            );
        }
    }

    return withRouter(WithAuthorization);
};
