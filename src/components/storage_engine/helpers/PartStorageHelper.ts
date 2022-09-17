import {detailedDiff} from "deep-object-diff";
import {Guid} from "guid-typescript";
import * as path from "path";
import {adjectives, colors, Config, uniqueNamesGenerator} from "unique-names-generator";
import {NEW_PART_TEMPLATE_DOCUMENT_UID} from "../../../constants/newPartTemplateDocument";
import {scifyDevices} from "../constants/SciFyDevices";
import {DocumentStorage} from "../DocumentStorage";
import {
    interfaceDataToObject,
    IPartData,
    IPartVersionData,
    IPropertyData,
    ITerminalData,
    IUserData,
    IVector2,
} from "../models/FirebaseDataModels";
import {DocumentStorageHelper} from "./DocumentStorageHelper";

export class PartStorageHelper {

    public static headVersionName = "HEAD";
    public static latestStableVersionName = "LATEST";

    public static partPropertyKeys = {partType: "Type", category: "category"};
    public static partPropertyCategories = {
        terminal: "Terminal",
        integratedCircuit: "Integrated Circuits",
    };

    public static getAssetUrl(partVersionData: IPartVersionData) {
        if (partVersionData.preview_image) {
            return path.join("/", "symbols", partVersionData.preview_image);
        } else {
            return path.join("/", "symbols", "module-icon.svg");
        }
    }

    public static getRequiredVersion(desiredVersion: string, part: IPartData) {
        if (part && desiredVersion === PartStorageHelper.latestStableVersionName) {
            return part.latest_version || desiredVersion;
        }
        return desiredVersion;
    }

    public static arePartVersionsEqual(originalPartVersion: IPartVersionData, updatedPartVersion: IPartVersionData) {
        const flatOriginalPartVersion = interfaceDataToObject(originalPartVersion);
        const flatUpdatedPartVersion = interfaceDataToObject(updatedPartVersion);

        const diff = detailedDiff(flatOriginalPartVersion, flatUpdatedPartVersion) as any;

        return this.isEmptyObject(diff.added) && this.isEmptyObject(diff.updated) && this.isEmptyObject(diff.deleted);
    }

    public static createElementPosition(sceneCursorPosition: boolean, x: number, y: number,
                                        orientation: number = 0, flip: boolean = false): IVector2 {
        return {
            scene_cursor_position: sceneCursorPosition,
            x,
            y,
            orientation,
            flip,
        } as IVector2;
    }

    public static createNewPartData(ownerUid: string) {
        return {
            uid: Guid.create().toString(),
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            latest_version: this.headVersionName,
            owner_uid: ownerUid,
            archived: false,
        } as IPartData;
    }

    public static createNewPartVersionData(ownerUid: string, partUid: string, version?: string, partName?: string) {
        const name: string = partName || uniqueNamesGenerator(this.baseNameGeneratorConfig);

        return {
            part_uid: partUid,
            name,
            owner_uid: ownerUid,
            version: version || this.headVersionName,
            created_at: new Date().getTime(),
            terminals: new Map<string, ITerminalData>(),
            properties: new Map<string, IPropertyData>(),
        } as IPartVersionData;
    }

    public static getRelativeUrl(user: IUserData, partVersion: IPartVersionData,
                                 callbackSuccess: (documentUrl: string) => void) {
        if (partVersion.document_import_uid) {
            new DocumentStorage().getDocumentUrlByUid(partVersion.document_import_uid).then((documentUrl) => {
                if (documentUrl) {
                    callbackSuccess(documentUrl);
                }
            });
        } else {
            callbackSuccess(path.join("/", encodeURIComponent(user.handle)));
        }
    }

    public static createNewPartFromTemplate(currentUser: IUserData, absoluteUrl = true) {
        return new DocumentStorage().getDocumentFromFirebase(NEW_PART_TEMPLATE_DOCUMENT_UID).then((documentData) => {
            const newDocument = DocumentStorageHelper.duplicateDocument(currentUser, documentData);

            return new DocumentStorage().setDocument(newDocument).then(() => {
                if (absoluteUrl) {
                    return DocumentStorageHelper.getAbsoluteUrl(currentUser, newDocument);
                } else {
                    return DocumentStorageHelper.getRelativeUrl(currentUser, newDocument);
                }
            });
        });
    }

    private static baseNameGeneratorConfig: Config = {
        dictionaries: [adjectives, colors, scifyDevices],
        separator: " ",
        style: "capital",
    };

    private static isEmptyObject(object: IPartVersionData) {
        return Object.entries(object).length === 0 && object.constructor === Object;
    }
}
