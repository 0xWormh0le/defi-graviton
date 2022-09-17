import {connectStateResults} from "react-instantsearch-dom";
import React, {useContext} from "react";
import Typography from "@material-ui/core/Typography";
import R from "../../resources/Namespace";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import {Divider} from "@material-ui/core";
import {PartStorageHelper} from "../../storage_engine/helpers/PartStorageHelper";
import AuthContext from "../../../AuthContext";

const StateResults = ({searchResults, isSearchStalled, searchState}) => {
    const {currentUser} = useContext(AuthContext);

    const hasResults = searchResults && searchResults.nbHits !== 0;
    const hasSearchQuery = searchState.query;

    function handleCreatePartBtnClick() {
        if (!currentUser) {
            return;
        }
        PartStorageHelper.createNewPartFromTemplate(currentUser).then((documentUrl) => {
            window.open(documentUrl, "_blank");
        });
    }

    if (!hasResults && !isSearchStalled) {
        return (
            <Box
                justifyContent="center"
                alignContent="center"
                textAlign="center"
                marginTop="60px"
                marginLeft="45px"
                marginRight="45px">
                <Typography variant="body2" gutterBottom align="center">
                    {R.strings.parts_browser.empty_state.content}
                </Typography>
                <Box marginTop="20px">
                    <Button
                        onClick={handleCreatePartBtnClick}
                        variant="contained"
                        color="primary">
                        {R.strings.parts_browser.empty_state.create_part_content}
                    </Button>
                </Box>
            </Box>
        );
    }

    if (hasResults && hasSearchQuery) {
        return (
            <>
                <Box marginTop="5px" marginBottom="5px" marginLeft="8px">
                    <Typography variant="caption">
                        Found {searchResults.nbHits}
                    </Typography>
                </Box>
                <Divider/>
            </>
        );
    }

    return null;
};

export const CustomStateResults = connectStateResults(StateResults);
