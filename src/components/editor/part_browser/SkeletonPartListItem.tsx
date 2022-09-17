import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Skeleton from "@material-ui/lab/Skeleton";
import React from "react";

export default function SkeletonPartListItem() {
    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Skeleton variant="rect" width={60} height={60}/>
            </ListItemAvatar>
            <ListItemText style={{margin: 10}}>
                <Skeleton height={15} style={{marginBottom: 6}}/>
                <Skeleton height={15} width="80%"/>
                <Skeleton height={15} width="60%"/>
            </ListItemText>
        </ListItem>
    );
}
