import Typography from "@material-ui/core/Typography";
import React from "react";
import {IKeyCommand} from "../../../resources/KeyCommands";
import KeyCommandViewer from "./KeyCommandViewer";

export default function KeyCommandsSection(props: any) {
    const commandKeys = props.keyCommands as IKeyCommand[];

    if (commandKeys.length === 0) {
        return null;
    }

    const sectionTitle = commandKeys[0].section;
    return <>
        <Typography variant="subtitle2" gutterBottom>
            <strong>{sectionTitle}</strong>
        </Typography>
        {
            commandKeys.map((keyCommand: IKeyCommand, index) => (
                <KeyCommandViewer key={index} keyCommand={keyCommand}/>
            ))
        }
        <br/>
    </>;
}
