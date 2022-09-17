import algoliaAdminSearch from "algoliasearch";
import algoliaSearch from "algoliasearch/lite";

export const algoliaClient = algoliaSearch(
    process.env.REACT_APP_ALGOLIA_APP_ID || "",
    process.env.REACT_APP_ALGOLIA_API_KEY || "",
);

// todo: we need to eventually move this to a cloud function cause otherwise
//  everyone has admin access to our search index
export const algoliaAdminClient = algoliaAdminSearch(
    process.env.REACT_APP_ALGOLIA_APP_ID || "",
    process.env.REACT_APP_ALGOLIA_ADMIN_KEY || "",
);

export const algoliaAppConfig = {
    searchPath: process.env.REACT_APP_ALGOLIA_SEARCH_PATH || "",
};
