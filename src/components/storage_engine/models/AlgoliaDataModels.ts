import {IPropertyData, ITerminalData} from "./FirebaseDataModels";

export interface ISearchPartData {
    objectID?: string;
    uid?: string;
    name?: string;
    description?: string;
    detailed_description?: string;
    created_at?: number;
    properties?: Map<string, IPropertyData>;
    terminals?: Map<string, ITerminalData>;
    archived?: boolean;
    version?: string;
    use_count?: number;
    owner_name?: string;
    owner_handle?: string;
}
