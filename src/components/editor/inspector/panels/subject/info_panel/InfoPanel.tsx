import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Moment from "moment";
import React, {useContext} from "react";
import R from "../../../../../resources/Namespace";
import {IElementData} from "../../../../../storage_engine/models/FirebaseDataModels";
import EditorContext from "../../../../DocumentContext";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        root: {
            "& .MuiTextField-root": {
                margin: theme.spacing(1),
            },
            "width": "100%",
        },
    }),
);

export default function InfoPanel(props: any) {
    const classes = useStyles();
    const selectedElementsData = props.elements as IElementData[];
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(EditorContext);
    const documentData = context.documentState;
    const setDocumentState = context.setDocumentState;

    if (selectedElementsData.length > 1) {
        return null;
    }

    const selectedElementData = selectedElementsData[0];

    const handleLabelChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!documentData || !context) {
            return;
        }

        const foundElement = documentData.elements.get(selectedElementData.uid);

        if (foundElement) {
            foundElement.label = event.target.value;

            setDocumentState?.(documentData);
        }
    };

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    if (!selectedElementData) {
        return null;
    }

    return (
        <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
                <Typography className={classes.heading}>{R.strings.inspector.info_section.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        fullWidth={true}
                        label={"Element Name"}
                        defaultValue={selectedElementData.label}
                        placeholder={"Element Label"}
                        onChange={handleLabelChange}
                        size="small"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth={true}
                        defaultValue={Moment(new Date(selectedElementData.created_at)).format("h:hh A - D MMM YYYY")}
                        label={"Created"}
                        size="small"
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        fullWidth={true}
                        defaultValue={Moment(new Date(selectedElementData.updated_at)).format("h:hh A - D MMM YYYY")}
                        label={"Last updated"}
                        size="small"
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
