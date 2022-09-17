import {connectHitInsights} from "react-instantsearch-dom";
import PartListItem from "./PartListItem";
import React from "react";

const Hit = ({hit, insights}) => {
    if (hit.uid) {
        return (
            <PartListItem
                key={hit.uid}
                partUid={hit.uid}
                partVersion={hit.version}
                partArchived={hit.archived}
                onAddToCanvas={() => {
                    insights("convertedObjectIDsAfterSearch", {
                        eventName: "Add part to canvas",
                    });
                }
                }
            />
        );
    } else {
        return null;
    }
};

export const HitWithInsights = connectHitInsights(window.aa)(Hit);
