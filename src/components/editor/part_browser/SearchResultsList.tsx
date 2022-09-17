import List from "@material-ui/core/List";
import React, {useCallback, useEffect, useRef} from "react";
import {connectInfiniteHits} from "react-instantsearch-dom";
import CustomPartDragPreview from "./CustomPartDragPreview";
import {HitWithInsights} from "./HitWithInsights";

interface IInfiniteHitsProps {
    hits: any[];
    hasMore: boolean;
    refineNext: () => void;
}

function InfiniteHits(props: IInfiniteHitsProps) {
    const {hits, hasMore, refineNext} = props;
    const sentinel: React.MutableRefObject<any> = useRef(null);
    const observer: React.MutableRefObject<IntersectionObserver | null> = useRef(null);

    const onSentinelIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && hasMore) {
                refineNext();
            }
        });
    }, [hasMore, refineNext]);

    useEffect(() => {
        observer.current = new IntersectionObserver(onSentinelIntersection);
        observer.current.observe(sentinel.current);

        return () => {
            observer.current?.disconnect();
        };
    }, [onSentinelIntersection]);

    return (
        <div className="searchResultsListContainer">
            <CustomPartDragPreview/>
            <List
                className="searchResultsList"
                component="ul"
                dense
                aria-labelledby="nested-list-subheader"
            >
                {
                    hits.map((hit) => (
                        <HitWithInsights key={hit.objectID} hit={hit}/>
                    ))
                }
                <li
                    className="searchResultsList-sentinel"
                    ref={sentinel}
                />
            </List>
        </div>
    );
}

export const SearchResultsList = connectInfiniteHits(InfiniteHits);
