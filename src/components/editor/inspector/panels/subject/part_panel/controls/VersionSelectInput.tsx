import {createStyles, FormControl, makeStyles, Theme} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React, {useContext, useEffect, useState} from "react";
import R from "../../../../../../resources/Namespace";
import {PartStorageHelper} from "../../../../../../storage_engine/helpers/PartStorageHelper";
import {IElementData, IPartData, IPartVersionData} from "../../../../../../storage_engine/models/FirebaseDataModels";
import {PartStorage} from "../../../../../../storage_engine/PartStorage";
import EditorContext from "../../../../../DocumentContext";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            margin: "8px",
        },
    }),
);

export default function VersionSelectInput(props: any) {
    const classes = useStyles();
    const selectedElementData = props.elementData as IElementData;
    const selectedElementPartData = props.part as IPartData;
    const selectedElementPartVersionData = props.partVersion as IPartVersionData;

    const context = useContext(EditorContext);
    const documentData = context.documentState;
    const setDocumentState = context.setDocumentState;

    const [loading, setLoading] = useState(true);
    const [partVersionsState, setPartVersionsState] = useState();

    useEffect(() => {
        if (selectedElementPartData && selectedElementPartVersionData) {
            const unsubscribe = new PartStorage().listenToPartVersionsByPartUid(
                selectedElementPartVersionData.part_uid,
                callbackSuccess);

            return () => unsubscribe();
        }

        function callbackSuccess(partVersions: IPartVersionData[]) {
            if (partVersions.length > 0) {
                setPartVersionsState(partVersions);
                setLoading(false);
            }
        }
    }, [selectedElementPartData, selectedElementData, selectedElementPartVersionData]);

    function removeHeadConstant(partVersions: IPartVersionData[]) {
        const index = partVersions.findIndex((partVersion) =>
            partVersion.version === PartStorageHelper.headVersionName);
        if (index > -1) {
            partVersions.splice(index, 1);
        }
        return partVersions;
    }

    const handleVersionChange = (event: any) => {
        if (!documentData || !partVersionsState || !selectedElementPartData) {
            return;
        }

        const foundElement = documentData.elements.get(selectedElementData.uid);

        if (foundElement) {
            const selectedVersion = PartStorageHelper.getRequiredVersion(event.target.value, selectedElementPartData);

            new PartStorage()
                .getPartVersionByPartUidAndVersion(foundElement.part_uid, selectedVersion)
                .then((partVersion) => {
                    if (partVersion) {
                        foundElement.part_version = event.target.value;
                        foundElement.part_version_data_cache = partVersion;
                        setDocumentState?.(documentData);
                    }
                });
        }
    };

    if (loading) {
        return null;
    }

    return (
        <FormControl className={classes.root}>
            <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                {R.strings.inspector.part_section.version_input}
            </InputLabel>
            <Select
                labelId="demo-simple-select-placeholder-label-label"
                id="demo-simple-select-placeholder-label"
                value={selectedElementData.part_version}
                onChange={handleVersionChange}
                displayEmpty
                fullWidth
                variant="outlined">
                <MenuItem
                    value={PartStorageHelper.headVersionName}
                    key={PartStorageHelper.headVersionName}>
                    {PartStorageHelper.headVersionName}
                </MenuItem>
                <MenuItem
                    value={PartStorageHelper.latestStableVersionName}
                    key={PartStorageHelper.latestStableVersionName}>
                    {PartStorageHelper.latestStableVersionName}
                </MenuItem>
                {removeHeadConstant(partVersionsState).map((partVersionData: IPartVersionData) => (
                    <MenuItem value={partVersionData.version} key={partVersionData.version}>
                        {partVersionData.version}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
