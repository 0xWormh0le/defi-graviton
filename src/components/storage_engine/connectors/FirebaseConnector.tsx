import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
firebase.firestore().enablePersistence({synchronizeTabs: true}).catch((err: any) => {
    if (err.code === "failed-precondition") {
        console.error(" Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else if (err.code === "unimplemented") {
        console.error("The current browser does not support all of the features required to enable persistence");
    }
});
