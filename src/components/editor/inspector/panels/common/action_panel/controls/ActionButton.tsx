import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";

export default function ActionButton(props: any) {
    const disabled = props.disabled;
    const handleOnClick = props.onClick;
    const iconComponent = props.iconComponent;
    const tooltipContent = props.tooltipContent;

    return (
        <Grid item xs>
            <Tooltip title={tooltipContent} placement="top">
                <span>
                    <IconButton aria-label="convert" onClick={handleOnClick} disabled={disabled} size="small">
                        {iconComponent}
                    </IconButton>
                </span>
            </Tooltip>
        </Grid>
    );
}
