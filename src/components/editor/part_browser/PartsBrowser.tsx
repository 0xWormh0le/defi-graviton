import {Divider} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import "instantsearch.css/themes/reset.css";
import React from "react";
import {Configure, InstantSearch} from "react-instantsearch-dom";
import {algoliaAppConfig, algoliaClient} from "../../storage_engine/connectors/AlgoliaClientConnector";
import {CustomStateResults} from "./CustomStateResults";
import "./PartsBrowser.css";
import {PartSearchInput} from "./PartSearchInput";
import {SearchResultsList} from "./SearchResultsList";
/*import {PartStorage} from "../../storage_engine/PartStorage";
import SeedData from "../../storage_engine/constants/SeedData";
import {IPartData, IPartVersionData} from "../../storage_engine/models/DataModels";*/

export default function PartsBrowser() {
/*    const parts:IPartVersionData[] = [];
    let partMap = new SeedData().parts;
    partMap.forEach((value) => {
        parts.push(value);
    });
    new PartStorage().seedPartsDBFromDummyData(parts);

    const terminalPart = new SeedData().terminalPart;
    if (terminalPart) {
        new PartStorage().seedPartsDBFromDummyData([terminalPart]);
    }*/

    return (
        <Grid item xs={2} className="partsBrowser">
            <InstantSearch indexName={algoliaAppConfig.searchPath} searchClient={algoliaClient}>
                <div className="partsBrowserHeader">
                    <Typography variant="subtitle1">
                        Insert Part
                    </Typography>
                    <Divider/>
                    <PartSearchInput/>
                    <Divider/>
                </div>
                <Configure clickAnalytics/>
                <CustomStateResults/>
                <SearchResultsList/>
            </InstantSearch>
        </Grid>
    );
}
