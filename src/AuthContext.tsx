import React from "react";
import {IUserData} from "./components/storage_engine/models/FirebaseDataModels";

interface IAppContextProps {
    currentUser: IUserData | null;
    setCurrentUser: (userData: IUserData) => void;
}

const AuthContext = React.createContext<Partial<IAppContextProps>>({});

export const AuthContextProvider = AuthContext.Provider;
export const AuthContextConsumer = AuthContext.Consumer;
export default AuthContext;
