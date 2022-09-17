import {createStyles, Theme} from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import React from "react";
import {IPropertyData} from "../../../../../storage_engine/models/FirebaseDataModels";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
    }),
);

export default function PropertyInput(props: any) {
    const classes = useStyles();

    const propertyData = props.propertyData;

    function getInputType(property: IPropertyData) {
        if (isNumeric(property.value)) {
            return "number";
        } else {
            return "string";
        }
    }

    function isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return (
        <TextField
            className={classes.margin}
            fullWidth={true}
            key={propertyData.key}
            value={propertyData.value}
            type={getInputType(propertyData)}
            name={propertyData.key}
            label={propertyData.key}
            InputProps={{
                endAdornment: <InputAdornment position="end">{propertyData.unit || ""}</InputAdornment>,
            }}
            onChange={props.onChange}
            size="small"
            variant="outlined"
        />
    );
}
