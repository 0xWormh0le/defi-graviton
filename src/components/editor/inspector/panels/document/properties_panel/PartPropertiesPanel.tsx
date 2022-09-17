import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, {useContext, useEffect, useState} from "react";
import R from "../../../../../resources/Namespace";
import {IPropertyData} from "../../../../../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../../../../../storage_engine/PartStorage";
import DocumentContext from "../../../../DocumentContext";
import PropertyInput from "../../common/controls/PropertyInput";

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
        },
    }),
);

export default function PartPropertiesPanel(props: any) {
    const classes = useStyles();
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(DocumentContext);
    const documentData = context.documentState;
    const setDocumentState = context.setDocumentState;
    const documentPartState = context.documentPartState;

    const [partVersionState, setPartVersionState] = useState();

    useEffect(() => {
        if (documentPartState) {
            new PartStorage().getPartVersionByPartUidAndVersion(documentPartState.uid).then((partVersion) => {
                setPartVersionState(partVersion);
            });
        }
    }, [documentPartState]);

    if (!partVersionState || !documentPartState || documentPartState.archived) {
        return null;
    }

    const partVersionProperties = Array.from(partVersionState.properties.values()) as IPropertyData[];

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!documentData || !context || !partVersionState) {
            return;
        }

        const foundProperty = partVersionState.properties.get(event.target.name);

        if (foundProperty) {
            foundProperty.value = event.target.value;

            setPartVersionState?.(partVersionState);

            new PartStorage().setPartVersion(partVersionState).then(() => {
                setDocumentState?.(documentData);
            });
        }
    };

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    return (
        <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel2a-content"
                id="panel2a-header"
            >
                <Typography className={classes.heading}>
                    {R.strings.inspector.document.properties_section.title}
                </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    {
                        partVersionProperties.map((property: IPropertyData) => (
                            <PropertyInput key={property.key} propertyData={property} onChange={handleChange}/>
                        ))}
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
