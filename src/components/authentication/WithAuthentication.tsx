import React, { useCallback, useEffect, useRef, useState  } from "react";
import {AuthContextProvider} from "../../AuthContext";
import {firebaseApp} from "../storage_engine/connectors/FirebaseConnector";
import {IUserData} from "../storage_engine/models/FirebaseDataModels";
import {UserStorage} from "../storage_engine/UserStorage";

export const withAuthentication = (Component: React.ComponentType) => {
    function WithAuthentication() {
        const [currentUser, setCurrentUserState] = useState<IUserData | null>(null);
        const unsubscribeRef: React.MutableRefObject<firebase.Unsubscribe | null> = useRef(null);

        const setCurrentUser = useCallback((userData: IUserData) => {
            setCurrentUserState(userData);
            new UserStorage().setUser(userData);
        }, []);

        useEffect(() => {
            unsubscribeRef.current = firebaseApp.auth().onAuthStateChanged((firebaseUser: firebase.User | null) => {
                if (firebaseUser) {
                    new UserStorage().getUserByUid(firebaseUser.uid).then((userData: IUserData | null) => {
                        if (userData) {
                            setCurrentUserState(userData);
                        }
                    });
                } else {
                    setCurrentUserState(null);
                }
            });

            return () => {
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                }
            };
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        return (
            <AuthContextProvider value={{
                currentUser,
                setCurrentUser,
            }}>
                <Component/>
            </AuthContextProvider>
        );
    }

    return WithAuthentication;
};
