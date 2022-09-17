import {Container, Paper, TableContainer} from "@material-ui/core";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import React, {useEffect, useState} from "react";
import {DocumentStorage, DocumentType} from "../storage_engine/DocumentStorage";
import {IDocumentData} from "../storage_engine/models/FirebaseDataModels";
import Error from "../utils/Error";
import ProfileDocsPartsFilterInput from "./ProfileDocsPartsFilterInput";
import ProfileDocsPartsTable from "./ProfileDocsPartsTable";
import ProfileDocsPartsTypeButtons from "./ProfileDocsPartsTypeButtons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        profileDocsParts: {
            overflowY: "auto",
            textAlign: "initial",
        },
        filtersContainer: {
            padding: theme.spacing(2),
        },
    }),
);

export type IFilterDocsPartsHandler = (typeFilter?: DocumentType, queryInput?: string) => void;

interface IUserDocumentsProps {
    profileUser: any;
}

export default function ProfileDocsParts(props: IUserDocumentsProps) {
    const classes = useStyles();
    const { profileUser } = props;
    const [documentsState, setDocumentsState] = useState<IDocumentData[]>();
    const [currentQuery, setCurrentQuery] = useState<string>("");
    const [currentType, setCurrentType] = useState<number>(DocumentType.circuit);
    const [filteredDocumentsState, setFilteredDocumentsState] = useState<typeof documentsState>();
    const [errorState, setErrorState] = useState<string>("");

    function filterByType(docsParts: IDocumentData[], typeFilter?: DocumentType): IDocumentData[] {
        if (!typeFilter) { return docsParts; }
        return docsParts.filter((itemDocPart) => {
            if (typeFilter === DocumentType.part) {
                return !!itemDocPart.belongs_to_part_uid;
            } else if (typeFilter === DocumentType.circuit) {
                return !itemDocPart.belongs_to_part_uid;
            }
            return true;
        });
    }

    function filterByInputQuery(docsParts: IDocumentData[], queryInput?: string): IDocumentData[] {
        if (!queryInput) { return docsParts; }
        return docsParts.filter((itemDocPart) => {
            return itemDocPart.name.toLowerCase().indexOf(queryInput.toLowerCase()) !== -1;
        });
    }

    let filterDocsPartsHandler: IFilterDocsPartsHandler;
    filterDocsPartsHandler = (typeFilter = currentType, queryInput = currentQuery): void => {
        let filteredDocsParts = documentsState || [];

        filteredDocsParts = filterByType(filteredDocsParts, typeFilter);
        setCurrentType(typeFilter);

        filteredDocsParts = filterByInputQuery(filteredDocsParts, queryInput);
        setCurrentQuery(queryInput);

        setFilteredDocumentsState(filteredDocsParts);
    };

    useEffect(() => {
        if (profileUser) {
            const unsubscribe = new DocumentStorage()
                .listenToUserDocuments(profileUser.uid, DocumentType.all, callbackSuccess, callbackError);
            return () => unsubscribe();
        }

        function callbackSuccess(documents: IDocumentData[]) {
            setErrorState("");
            setDocumentsState(documents);
        }

        function callbackError(error: string) {
            setErrorState(error);
        }

    }, [profileUser]);

    useEffect(() => {
        filterDocsPartsHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentsState]);

    if (errorState) {
        return (
            <Error content={"Error loading your documents and parts.\nMessage: " + errorState}/>
        );
    }

    return (
        <TableContainer component={Paper} square className={classes.profileDocsParts}>
            <Container disableGutters className={classes.filtersContainer}>
                <ProfileDocsPartsFilterInput
                    currentQuery={currentQuery}
                    filterDocsPartsHandler={filterDocsPartsHandler}
                />
                <ProfileDocsPartsTypeButtons
                    currentType={currentType}
                    filterDocsPartsHandler={filterDocsPartsHandler}
                />
            </Container>
            <ProfileDocsPartsTable
                fetchedDocsParts={filteredDocumentsState}
                profileUser={profileUser}/>
        </TableContainer>
    );
}
