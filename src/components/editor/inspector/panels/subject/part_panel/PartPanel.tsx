import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Moment from "moment";
import React, {useEffect, useState} from "react";
import BRANCH_POINT_UID from "../../../../../../constants/branchPointUid";
import R from "../../../../../resources/Namespace";
import {PartStorageHelper} from "../../../../../storage_engine/helpers/PartStorageHelper";
import {IElementData, IPartData, IPartVersionData} from "../../../../../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../../../../../storage_engine/PartStorage";
import VersionSelectInput from "./controls/VersionSelectInput";

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

export default function PartPanel(props: any) {
    const classes = useStyles();
    const selectedElementsData = props.elements as IElementData[];
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;
    const selectedElementData = selectedElementsData[0];

    const [loading, setLoading] = useState(true);
    const [errorState, setErrorState] = useState();
    const [partVersionState, setPartVersionState] = useState();
    const [partState, setPartState] = useState();

    useEffect(() => {
        if (selectedElementData) {
            if (selectedElementData.part_uid !== BRANCH_POINT_UID) {
                new PartStorage().getPartByUid(selectedElementData.part_uid).then((part: IPartData) => {
                    if (part) {
                        setPartState(part);
                    }
                });
            }
        }
    }, [selectedElementData]);

    useEffect(() => {
        if (selectedElementData) {

            const version = PartStorageHelper.getRequiredVersion(selectedElementData.part_version, partState);

            const unsubscribe = new PartStorage().listenToPartVersionByPartUidAndVersion(
                selectedElementData.part_uid,
                version,
                callbackSuccess,
                callbackError);

            return () => unsubscribe();
        }

        function callbackSuccess(partVersion: IPartVersionData) {
            setPartVersionState(partVersion);
            setLoading(false);
            setErrorState(null);
        }

        function callbackError(error: string) {
            setErrorState(error);
        }
    }, [selectedElementData, partState]);

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    function renderPanelContent() {
        if (errorState) {
            return (
                <>
                    {"Error" + errorState}
                </>
            );
        }

        if (!loading) {
            return (
                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <TextField
                        label={R.strings.inspector.part_section.name_input}
                        value={partVersionState.name}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth={true}
                        size="small"
                    />
                    <TextField
                        label={R.strings.inspector.part_section.description_input}
                        value={partVersionState.description}
                        multiline
                        rowsMax="4"
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth={true}
                        size="small"
                    />

                    <VersionSelectInput elementData={selectedElementData} part={partState}
                                        partVersion={partVersionState}/>

                    <TextField
                        label={R.strings.inspector.part_section.created_at_input}
                        value={Moment(new Date(partVersionState.created_at)).format("D MMM YYYY")}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="outlined"
                        fullWidth={true}
                        size="small"
                    />
                </form>
            );
        } else {
            return (
                <>
                    {"Loading"}
                </>
            );
        }
    }

    return (
        <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
                <Typography className={classes.heading}>{R.strings.inspector.part_section.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                {renderPanelContent()}
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
