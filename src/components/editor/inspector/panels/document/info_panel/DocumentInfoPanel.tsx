import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Moment from "moment";
import React, {useContext} from "react";
import AuthContext from "../../../../../../AuthContext";
import R from "../../../../../resources/Namespace";
import {DocumentStorageHelper} from "../../../../../storage_engine/helpers/DocumentStorageHelper";
import {PartStorage} from "../../../../../storage_engine/PartStorage";
import DocumentContext from "../../../../DocumentContext";

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

export default function DocumentInfoPanel(props: any) {
    const classes = useStyles();

    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(DocumentContext);
    const {currentUser} = useContext(AuthContext);
    const documentData = context.documentState;
    const setDocumentState = context.setDocumentState;
    const documentPartState = context.documentPartState;
    const setDocumentPartState = context.setDocumentPartState;

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!documentData || !context) {
            return;
        }

        documentData.description = event.target.value;
        setDocumentState?.(documentData);
    };

    const handleIsPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!documentData || !context || !currentUser) {
            return;
        }

        if (event.target.checked) {
            if (documentData.belongs_to_part_uid) {
                new PartStorage().setArchiveStateByPartByUid(documentData.belongs_to_part_uid, false);
                if (documentPartState) {
                    documentPartState.archived = false;
                    setDocumentPartState?.(documentPartState);
                }
            } else {
                new PartStorage().createPartForDocument(currentUser, documentData).then((result) => {
                    setDocumentPartState?.(result.partData);
                    setDocumentState?.(result.documentData);
                });
            }
        } else {
            new PartStorage().setArchiveStateByPartByUid(documentData.belongs_to_part_uid, true);
            if (documentPartState) {
                documentPartState.archived = true;
                setDocumentPartState?.(documentPartState);
            }
        }
    };

    function isLoading() {
        if (documentData?.belongs_to_part_uid && documentPartState) {
            return false;
        } else if (!documentData?.belongs_to_part_uid) {
            return false;
        } else {
            return true;
        }
    }

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    if (!documentData) {
        return null;
    }

    return (
        <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
                <Typography className={classes.heading}>{R.strings.inspector.document.info_section.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        fullWidth={true}
                        defaultValue={documentData.description}
                        label={"Description"}
                        placeholder={"Description"}
                        onChange={handleDescriptionChange}
                        size="small"
                        multiline
                        rowsMax={6}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth={true}
                        defaultValue={Moment(new Date(documentData.created_at)).format("h:hh A D MMM YYYY")}
                        label={"Created"}
                        size="small"
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <TextField
                        fullWidth={true}
                        defaultValue={Moment(new Date(documentData.updated_at)).format("h:hh A D MMM YYYY")}
                        label={"Last updated"}
                        size="small"
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <FormControlLabel className="documentPartSwitch"
                                      control={
                                          <Switch
                                              onChange={handleIsPartChange}
                                              checked={
                                                  DocumentStorageHelper.documentIsPart(documentData, documentPartState)
                                              }
                                              color="primary"
                                              disabled={isLoading()}
                                          />
                                      }
                                      label="Is Part"
                    />
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
