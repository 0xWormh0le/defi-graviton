import {cloneDeep} from "lodash";

export type ISubjectData = IElementData | IRouteData;

export interface IDocumentData {
    uid: string;
    name: string;
    description: string;
    slug: string;
    created_at: number;
    updated_at: number;
    owner_uid: string;
    elements: Map<string, IElementData>;
    routes: Map<string, IRouteData>;
    properties: Map<string, IDocumentPropertyData>;
    active_users: Map<string, IUserPresence>;
    belongs_to_part_uid: string | "";
    copy_of_document_uid: string;
}

export interface IElementData {
    uid: string;
    label?: string;
    created_at: number;
    updated_at: number;
    part_uid: string;
    part_version: string;
    part_version_data_cache: IPartVersionData;
    diagram_position: IVector2;
    properties: Map<string, IPropertyData>;
}

export interface IVector2 {
    x: number;
    y: number;
    orientation?: number;
    flip?: boolean;
    scene_cursor_position?: boolean;
}

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IPropertyData {
    key: string;
    value: string | number | boolean | {};
    unit?: string;
    system?: boolean;
}

export interface IDocumentPropertyData {
    user_uid: string;
    section: string;
    key: string;
    value: string | number | boolean | {};
}

export interface ITerminalData {
    uid: string;
    type?: string;
    name?: string;
    label_alignment?: string;
    position?: IVector2;
}

export interface IUserPresence {
    user_uid: string;
    user_handle: string;
    last_seen: number;
    status: string;
}

export interface IRouteData {
    uid: string;
    created_at: number;
    updated_at: number;
    owner_uid: string;
    label?: string;
    properties: Map<string, IPropertyData>;
    endpoints: {
        start_element_terminal: IElementTerminalData,
        end_element_terminal: IElementTerminalData,
    };
    middleVertices: Map<number, IVertice>;
    canAutoRoute: boolean;
}

/// TODO: @Chris please use IVector3 instead
export interface IVertice {
    index: number;
    x: number;
    y: number;
    z: number;
}

export interface ISegmentData {
    uid: string;
    route_uid: string;
    terminalStartPosition: IVector3;
    terminalEndPosition: IVector3;
    properties: Map<string, IPropertyData>;
}

export interface IElementTerminalData {
    element_uid: string;
    terminal_uid: string;
}

export interface IUserData {
    uid: string;
    full_name?: string;
    handle: string;
    locale?: string;
    email?: string;
    picture?: string;
    isAnonymous: boolean;
    sign_up_referrer?: string;
}

export interface IPartData {
    uid: string;
    owner_uid: string;
    latest_version: string;
    archived: boolean;
    created_at: number;
    updated_at: number;
}

export interface IPartVersionData {
    part_uid: string;
    name: string;
    version: string;
    description?: string;
    detailed_description?: string;
    created_at: number;
    properties: Map<string, IPropertyData>;
    terminals: Map<string, ITerminalData>;
    symbol_resource_file?: string;
    preview_image?: string;
    document_import_uid?: string;
    owner_uid: string;
}

export function deepCopy(data: any) {
    const obj = interfaceDataToObject(data);
    const copy = cloneDeep(obj);
    return flatObjectToInterface(copy);
}

// Takes an interface and creates a flattened object out of it (converts maps to object properties)
export function interfaceDataToObject(data: any) {
    const obj: any = {};
    for (const [dataKey, dataValue] of Object.entries(data)) {
            if (dataValue instanceof Map) {
            const mapObj: any = {};
            dataValue.forEach((value, key) => {
                Object.defineProperty(mapObj, key.toString(), {
                    value: interfaceDataToObject(value),
                    writable: true,
                    enumerable: true,
                });
            });
            Object.defineProperty(mapObj, "dataStructureIsMap", {
                value: true,
                writable: true,
                enumerable: true,
            });
            Object.defineProperty(obj, dataKey.toString(), {
                value: mapObj,
                writable: true,
                enumerable: true,
            });
        } else if (dataValue instanceof Object) {
            Object.defineProperty(obj, dataKey, {
                value: interfaceDataToObject(dataValue),
                writable: true,
                enumerable: true,
            });
        } else {
            Object.defineProperty(obj, dataKey, {
                value: dataValue,
                writable: true,
                enumerable: true,
            });
        }
    }
    return obj;
}

// Flat object without maps or arrays
export function flatObjectToInterface(object: any) {
    const obj: any = {};
    for (const [objKey, objValue] of Object.entries(object)) {
        if (objValue === {}) {
            Object.defineProperty(obj, objKey, {
                value: {},
                writable: true,
                enumerable: true,
            });
            // @ts-ignore
        } else if (objValue.dataStructureIsMap) {
            Object.defineProperty(obj, objKey, {
                value: createMap(objValue),
                writable: true,
                enumerable: true,
            });
        } else if (objValue instanceof Object) {
            Object.defineProperty(obj, objKey, {
                value: flatObjectToInterface(objValue),
                writable: true,
                enumerable: true,
            });
        } else {
            Object.defineProperty(obj, objKey, {
                value: objValue,
                writable: true,
                enumerable: true,
            });
        }
    }
    return obj;
}

function createMap(object: any) {
    const result: Map<any, any> = new Map();
    if (object.dataStructureIsMap) {
        delete object.dataStructureIsMap;
    }
    for (const [key, value] of Object.entries(object)) {
        result.set(key, flatObjectToInterface(value));
    }
    return result;
}
