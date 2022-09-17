import firebase from "firebase/app";
import * as path from "path";
import Slugify from "slugify";
import {colors, Config, starWars, uniqueNamesGenerator} from "unique-names-generator";
import {BaseStorage} from "./BaseStorage";
import {firebaseApp} from "./connectors/FirebaseConnector";
import {IUserData} from "./models/FirebaseDataModels";

export class UserStorage extends BaseStorage {

    public static generateAnonUserName() {
        const displayName = uniqueNamesGenerator(this.nameGeneratorConfig);
        const handle = Slugify(displayName, {remove: /[*+~.()'"!:@]/g}).toLowerCase();

        return {handle, displayName};
    }

    public static getUserProfileUrl(user: IUserData) {
        return path.join("/", user.handle);
    }

    private static nameGeneratorConfig: Config = {
        dictionaries: [colors, starWars],
        separator: " ",
        style: "capital",
        length: 2,
    };

    public setUser(user: IUserData) {
        this.setUsername(user);

        return this.queryUsers()
            .doc(user.handle.toLowerCase())
            .set(user);
    }

    public getOrSetUser(firebaseUser: firebase.User, handle: string, anonName?: string, referrer?: string) {
        return this.getUserByUid(firebaseUser.uid).then((userData: IUserData | null) => {
            if (userData) {
                if (!firebaseUser.isAnonymous) {
                    userData.email = firebaseUser.email || userData.email;
                    userData.full_name = firebaseUser.displayName || userData.full_name;
                    userData.picture = firebaseUser.photoURL || userData.picture;
                    userData.isAnonymous = firebaseUser.isAnonymous;
                    userData.sign_up_referrer = referrer || "";
                    this.setUser(userData);
                }
                return userData;
            } else {
                const newUserData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    full_name: firebaseUser.displayName || anonName || "",
                    picture: firebaseUser.photoURL || "",
                    handle,
                    isAnonymous: firebaseUser.isAnonymous,
                    sign_up_referrer: referrer || "",
                } as IUserData;

                this.setUser(newUserData);
                return newUserData;
            }
        });
    }

    public getUserByHandle(handle: string) {
        return this.queryUsers().doc(handle.toLowerCase()).get().then((result: any) => {
            const user = result.data();
            return user as IUserData;
        });
    }

    public handleExists(handle: string) {
        return this.queryUsernames().doc(handle.toLowerCase()).get()
            .then((result: any) => {
                return !!result.data();
            });
    }

    public getUserByUid(userUid: string) {
        return this.queryUserByUid(userUid).get().then((result: any) => {
            const doc = result.docs[0];
            if (doc) {
                return doc.data() as IUserData;
            }
            return null;
        });
    }

    public listenToUserByUid(
        userUid: string,
        callbackSuccess: (userData: IUserData) => void,
        callbackError: (error: any) => void) {
        return this.queryUserByUid(userUid).onSnapshot((querySnapshot: any) => {
            const user = querySnapshot.docs[0];
            if (user) {
                callbackSuccess(user.data() as IUserData);
            } else {
                callbackError("Can't find user");
            }
        });
    }

    private setUsername(user: IUserData) {
        return this.queryUsernames().doc(user.handle.toLowerCase()).set({user_uid: user.uid});
    }

    private queryUsernames() {
        return firebaseApp.firestore().collection(this.usernamesNamespace);
    }

    private queryUsers() {
        return firebaseApp.firestore().collection(this.usersNamespace);
    }

    private queryUserByUid(userUid: string) {
        return this.queryUsers()
            .where("uid", "==", userUid);
    }
}
