import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, {useContext} from "react";
import R from "../../../../../resources/Namespace";
import {IElementData, IPropertyData} from "../../../../../storage_engine/models/FirebaseDataModels";
import EditorContext from "../../../../DocumentContext";
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

export default function PropertiesPanel(props: any) {
    const classes = useStyles();
    const elements = props.elements as IElementData[];
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(EditorContext);
    const documentData = context.documentState;
    const setDocumentState = context.setDocumentState;

    if (elements.length > 1) {
        return null;
    }

    const elementData = elements[0];
    const elementProperties = Array.from(elementData.properties.values()) as IPropertyData[];

    if (elementProperties.length === 0) {
        return null;
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!documentData || !context) {
            return;
        }

        const foundElement = documentData.elements.get(elementData.uid);

        if (foundElement) {
            const foundProperty = foundElement.properties.get(event.target.name);

            if (foundProperty) {
                foundProperty.value = event.target.value;

                setDocumentState?.(documentData);
            }
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
                <Typography className={classes.heading}>{R.strings.inspector.properties_section.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    {
                        elementProperties.map((property: IPropertyData) => (
                            <PropertyInput key={property.key} propertyData={property} onChange={handleChange}/>
                        ))}
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
