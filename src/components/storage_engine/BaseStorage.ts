import {algoliaAdminClient, algoliaAppConfig} from "./connectors/AlgoliaClientConnector";

export class BaseStorage {
    protected documentNamespace = process.env.REACT_APP_FIREBASE_DOCUMENTS_NAMESPACE || "";
    protected partsNamespace = process.env.REACT_APP_FIREBASE_PARTS_NAMESPACE || "";
    protected versionsNamespace = process.env.REACT_APP_FIREBASE_PART_VERSIONS_NAMESPACE || "";
    protected usersNamespace = process.env.REACT_APP_FIREBASE_USERS_NAMESPACE || "users";
    protected usernamesNamespace = process.env.REACT_APP_FIREBASE_USER_NAMES_NAMESPACE || "usernames";

    protected partSearchIndex = algoliaAdminClient.initIndex(algoliaAppConfig.searchPath);

    constructor() {
        if (this.documentNamespace.length === 0) {
            console.error("Environment variable is missing: REACT_APP_FIRESTORE_PARTS_NAMESPACE");
        }
        if (this.partsNamespace.length === 0) {
            console.error("Environment variable is missing: REACT_APP_FIRESTORE_PARTS_NAMESPACE");
        }
        if (this.versionsNamespace.length === 0) {
            console.error("Environment variable is missing: REACT_APP_FIRESTORE_PARTS_VERSIONS_NAMESPACE");
        }

        if (algoliaAppConfig.searchPath.length === 0) {
            console.error("Algolia search path is missing, check if the environment variable set");
        }
    }
}
