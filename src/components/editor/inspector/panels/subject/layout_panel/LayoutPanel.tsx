import {createStyles, makeStyles, Theme} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, {useContext} from "react";
import R from "../../../../../resources/Namespace";
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

export default function LayoutPanel(props: any) {
    const classes = useStyles();
    const selectedElementsData = props.elements;
    const panelExpanded = props.panelExpanded;
    const setPanelExpanded = props.onExpansionChange;

    const context = useContext(DocumentContext);
    const documentData = context.documentState;
    const setDocumentData = context.setDocumentState;

    if (!selectedElementsData || selectedElementsData.length === 0) {
        return null;
    }

    function getSelectedElementsPosition() {
        const selectedElementData = selectedElementsData[0];
        const diagramPosition = selectedElementData.diagram_position;

        const diagramPositionX = diagramPosition.x as number;
        const diagramPositionY = diagramPosition.y as number;
        return {positionX: diagramPositionX, positionY: diagramPositionY};
    }

    const {positionX, positionY} = getSelectedElementsPosition();

    const handlePositionChange = (event: any) => {
        if (!documentData || !setDocumentData) {
            return;
        }

        const originalPositionX = +selectedElementsData[0].diagram_position.x;
        const originalPositionY = +selectedElementsData[0].diagram_position.y;
        selectedElementsData.forEach((selectedElement: any) => {
            if (event.target.name === "X") {
                const deltaX = +event.target.value - originalPositionX;
                selectedElement.diagram_position.x = selectedElement.diagram_position.x + +deltaX;
            }
            if (event.target.name === "Y") {
                const deltaY = +event.target.value - originalPositionY;
                selectedElement.diagram_position.y = selectedElement.diagram_position.y + +deltaY;
            }
            documentData.elements.set(selectedElement.uid, selectedElement);
        });

        setDocumentData(documentData);
    };

    function updatePanelExpansionState() {
        setPanelExpanded(!panelExpanded);
    }

    return (
        <ExpansionPanel expanded={panelExpanded} onChange={updatePanelExpansionState}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography className={classes.heading}>{R.strings.inspector.layout_section.title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>

                <form className={classes.root} noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <div>
                        <TextField
                            label={R.strings.inspector.layout_section.x_position_label}
                            value={positionX}
                            type="number"
                            name="X"
                            InputProps={{}}
                            onChange={handlePositionChange}
                            size="small"
                            variant="outlined"
                            fullWidth={true}
                        />
                        <TextField
                            label={R.strings.inspector.layout_section.y_position_label}
                            value={positionY}
                            type="number"
                            name="Y"
                            InputProps={{}}
                            onChange={handlePositionChange}
                            size="small"
                            variant="outlined"
                            fullWidth={true}
                        />
                    </div>
                </form>

            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
