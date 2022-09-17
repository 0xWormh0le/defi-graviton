import {detailedDiff} from "deep-object-diff";
import {Guid} from "guid-typescript";
import * as path from "path";
import Slugify from "slugify";
import { Vector3 } from "three";
import cloneDeep from "ts-deepcopy";
import {adjectives, colors, Config, uniqueNamesGenerator} from "unique-names-generator";
import BRANCH_POINT_UID from "../../../constants/branchPointUid";
import {getRotationStep} from "../../editor/photon_engine/helpers/PhotonEngineHelpers";
import RouteSubject from "../../editor/photon_engine/scene_subjects/RouteSubject";
import SegmentSubject from "../../editor/photon_engine/scene_subjects/SegmentSubject";
import R from "../../resources/Namespace";
import {scifyDevices} from "../constants/SciFyDevices";
import {UserPresenceStatus} from "../DocumentStorage";
import {
    flatObjectToInterface,
    IDocumentData,
    IDocumentPropertyData,
    IElementData,
    IElementTerminalData,
    interfaceDataToObject,
    IPartData,
    IPartVersionData,
    IPropertyData,
    IRouteData,
    ISegmentData,
    ISubjectData,
    ITerminalData,
    IUserData,
    IUserPresence,
    IVector2,
    IVector3,
    IVertice,
} from "../models/FirebaseDataModels";
import {ConnectionType, IConnection} from "../PartStorage";
import {PartStorageHelper} from "./PartStorageHelper";

export class DocumentStorageHelper {
    public static getElementsPosition(elements: IElementData[]) {
        const positions = elements
            .map((element) => element.diagram_position).filter((position) => position);

        const xPositions = positions.map((position) =>
            position.x) as number[];
        const yPositions = positions.map((position) =>
            position.y) as number[];

        const minXPosition = Math.min(...xPositions);
        const maxXPosition = Math.max(...xPositions);
        const minYPosition = Math.min(...yPositions);
        const maxYPosition = Math.max(...yPositions);

        let xPosition = minXPosition;
        if (minXPosition !== maxXPosition) {
            xPosition = ((minXPosition - maxXPosition) / 2) + maxXPosition;
        }

        let yPosition = minYPosition;
        if (minYPosition !== maxYPosition) {
            yPosition = ((minYPosition - maxYPosition) / 2) + maxYPosition;
        }

        return {x: xPosition, y: yPosition} as IVector2;
    }

    public static setPresence(user: IUserData, documentData: IDocumentData, status: UserPresenceStatus) {
        documentData.active_users.set(user.uid, {
            user_uid: user.uid,
            user_handle: user.handle,
            last_seen: new Date().getTime(),
            status: status.toString(),
        } as IUserPresence);
    }

    public static isElementData(object: any): object is IElementData {
        return "diagram_position" in object;
    }

    public static isRouteData(object: any): object is IRouteData {
        return "endpoints" in object;
    }

    public static createNewRouteData(
        startElementDataUid: string,
        startTerminalDataUid: string,
        endElementDataUid: string,
        endTerminalDataUid: string,
        userUid: string,
        canAutoRoute = true) {
        return {
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            endpoints: {
                start_element_terminal: {
                    element_uid: startElementDataUid,
                    terminal_uid: startTerminalDataUid,
                } as IElementTerminalData,
                end_element_terminal: {
                    element_uid: endElementDataUid,
                    terminal_uid: endTerminalDataUid,
                } as IElementTerminalData,
            },
            uid: Guid.create().toString(),
            owner_uid: userUid,
            properties: new Map<string, IPropertyData>(),
            canAutoRoute,
            middleVertices: new Map<number, IVertice>([
                [0, {index: 0, x: 0, y: 0, z: R.layout.z_order.route} as IVertice],
                [1, {index: 1, x: 0, y: 0, z: R.layout.z_order.route} as IVertice],
                [2, {index: 2, x: 0, y: 0, z: R.layout.z_order.route} as IVertice],
                [3, {index: 3, x: 0, y: 0, z: R.layout.z_order.route} as IVertice],
            ]),
        } as IRouteData;
    }

    public static createNewRouteDataForBranchPoint(
        startElementDataUid: string,
        startTerminalDataUid: string,
        endElementDataUid: string,
        endTerminalDataUid: string,
        refRoute: RouteSubject,
        // Segment object that reflects intersected (line)
        refSegment: SegmentSubject,
        point: Vector3,
        userUid: string) {
        const middleVertices = new Map<number, IVertice>();
        const refSegments = refRoute.getSegments();
        const vertices = [];
        let verticeStart;

        if (refRoute.elementA?.subjectUid === startElementDataUid) {
            let index;
            verticeStart = refSegments[0].getSubjectData().terminalStartPosition;

            for (index = 1; index < refSegments.length - 1; index++) {
                const vertice = refSegments[index].getSubjectData().terminalStartPosition;
                vertices.push(vertice);
                if (refSegment.subjectUid === refSegments[index].subjectUid) {
                    break;
                }
            }
        } else {
            let index;

            verticeStart = refSegments[refSegments.length - 2].getSubjectData().terminalEndPosition;

            for (index = refSegments.length - 2; index >= 1; index--) {
                const vertice = refSegments[index].getSubjectData().terminalEndPosition;
                vertices.push(vertice);
                if (refSegment.subjectUid === refSegments[index].subjectUid) {
                    break;
                }
            }
        }
        const leftCnt = 4 - vertices.length;
        for (let i = 0; i < leftCnt; i++) {
            middleVertices.set(i,
                     {index: i, x: verticeStart.x, y: verticeStart.y, z: verticeStart.z} as IVertice);
        }

        vertices.forEach((vertex, index) => {
            middleVertices.set(index + leftCnt,
                {index: index + leftCnt, x: vertex.x, y: vertex.y, z: vertex.z} as IVertice);
        });

        return {
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            endpoints: {
                start_element_terminal: {
                    element_uid: startElementDataUid,
                    terminal_uid: startTerminalDataUid,
                } as IElementTerminalData,
                end_element_terminal: {
                    element_uid: endElementDataUid,
                    terminal_uid: endTerminalDataUid,
                } as IElementTerminalData,
            },
            uid: Guid.create().toString(),
            owner_uid: userUid,
            properties: new Map<string, IPropertyData>(),
            canAutoRoute: false,
            middleVertices,
        } as IRouteData;
    }

    public static createNewRouteDataToBranchPoint(elementA: IElementData,
                                                  terminalA: ITerminalData,
                                                  branchPointUid: string,
                                                  branchPointTerminalUid: string,
                                                  branchPoint: Vector3,
                                                  refSegment: SegmentSubject,
                                                  userUid: string) {
        const vertices = [
            {index: 0, x: 0, y: 0, z: R.layout.z_order.route} as IVertice,
            {index: 1, x: 0, y: 0, z: R.layout.z_order.route} as IVertice,
            {index: 2, x: 0, y: 0, z: R.layout.z_order.route} as IVertice,
            {index: 3, x: 0, y: 0, z: R.layout.z_order.route} as IVertice,
        ];
        if (refSegment.isHorizontal) {
            vertices[0].x = elementA.diagram_position.x + (terminalA.position?.x as number);
            vertices[0].y = elementA.diagram_position.y + (terminalA.position?.y as number) + 2.5;
            vertices[1].x = vertices[0].x;
            vertices[1].y = vertices[0].y;
            vertices[2].x = vertices[1].x;
            vertices[2].y = vertices[1].y;
            vertices[3].x = branchPoint.x;
            vertices[3].y = vertices[2].y;
        } else {
            vertices[0].x = elementA.diagram_position.x + (terminalA.position?.x as number);
            vertices[0].y = elementA.diagram_position.y + (terminalA.position?.y as number) + 2.5;
            vertices[1].x = vertices[0].x;
            vertices[1].y = vertices[0].y;
            vertices[2].x = vertices[1].x;
            vertices[2].y = vertices[1].y;
            vertices[3].x = vertices[2].x;
            vertices[3].y = branchPoint.y;
        }
        return {
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            endpoints: {
                start_element_terminal: {
                    element_uid: elementA.uid,
                    terminal_uid: terminalA.uid,
                } as IElementTerminalData,
                end_element_terminal: {
                    element_uid: branchPointUid,
                    terminal_uid: branchPointTerminalUid,
                } as IElementTerminalData,
            },
            uid: Guid.create().toString(),
            owner_uid: userUid,
            properties: new Map<string, IPropertyData>(),
            canAutoRoute: false,
            middleVertices: new Map<number, IVertice>([
                [0, vertices[0]],
                [1, vertices[1]],
                [2, vertices[2]],
                [3, vertices[3]],
            ]),
        } as IRouteData;
    }

    public static createNewSegment(routeUid: string, terminalStartPosition: IVector3,
                                   terminalEndPosition: IVector3): ISegmentData {
        return {
            uid: Guid.create().toString(),
            route_uid: routeUid,
            terminalStartPosition,
            terminalEndPosition,
            properties: new Map<string, IPropertyData>(),
        };
    }

    public static createBranchElementData(position: IVector2, userUid: string): IElementData {
        const now = new Date().getTime();
        const partData = {
            part_uid: BRANCH_POINT_UID,
            name: "Branch Point Terminals",
            version: "0.1",
            created_at: now,
            properties: new Map<string, IPropertyData>(),
            terminals: new Map<string, ITerminalData>(),
            owner_uid: userUid,
        } as IPartVersionData;
        return {
            uid: Guid.create().toString(),
            created_at: now,
            updated_at: now,
            part_uid: BRANCH_POINT_UID,
            part_version: "0.1",
            part_version_data_cache: partData,
            diagram_position: position,
            properties: new Map<string, IPropertyData>(),
        } as IElementData;
    }

    public static createNewElementData(partVersionData: IPartVersionData, diagramPosition: IVector2): IElementData {
        // TODO@Chris IPartVersionData has to be deep cloned, since ts passes by reference afaik for objects.
        const clonedPartVersion = flatObjectToInterface(cloneDeep(interfaceDataToObject(partVersionData)));

        return {
            uid: Guid.create().toString(),
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            part_uid: partVersionData.part_uid,
            part_version: partVersionData.version,
            part_version_data_cache: clonedPartVersion,
            diagram_position: diagramPosition,
            properties: clonedPartVersion.properties,
        } as IElementData;
    }

    public static duplicateDocument(user: IUserData, existingDocument: IDocumentData) {
        const newDocument = DocumentStorageHelper.createNewDocumentData(user);
        newDocument.copy_of_document_uid = existingDocument.uid;

        if (existingDocument.owner_uid !== user.uid) {
            newDocument.name = existingDocument.name;
        }

        newDocument.elements = existingDocument.elements;
        newDocument.routes = existingDocument.routes;
        newDocument.properties = existingDocument.properties;

        return newDocument;
    }

    public static createNewDocumentData(user: IUserData) {
        const name: string = uniqueNamesGenerator(this.baseNameGeneratorConfig);

        return {
            uid: Guid.create().toString(),
            name,
            description: "",
            slug: this.createSlug(name),
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            owner_uid: user.uid,
            elements: new Map<string, IElementData>(),
            routes: new Map<string, IRouteData>(),
            properties: new Map<string, IDocumentPropertyData>(),
            active_users: new Map<string, IUserPresence>(),
            belongs_to_part_uid: "",
        } as IDocumentData;
    }

    public static setDocumentName(documentData: IDocumentData, name: string) {
        documentData.name = name;
        documentData.slug = this.createSlug(name);
    }

    public static isDocumentNameValid(name: string) {
        const minLength = 3;
        const maxLength = 150;
        return (name && name.length >= minLength && name.length <= maxLength);
    }

    public static getAbsoluteUrl(user: IUserData, document: IDocumentData) {
        const relativeUrl = DocumentStorageHelper.getRelativeUrl(user, document);

        return new URL(relativeUrl, window.location.origin).toString();
    }

    public static getRelativeUrl(user: IUserData, document: IDocumentData) {
        return path.join("/", encodeURIComponent(user.handle), document.slug);
    }

    public static getNonTerminalElements(documentData: IDocumentData) {
        const elements: IElementData[] = [];
        documentData.elements.forEach((element) => {
            const property = element
                .part_version_data_cache
                .properties
                .get(PartStorageHelper.partPropertyKeys.category);
            if (!property || property?.value !== PartStorageHelper.partPropertyCategories.terminal) {
                elements.push(element);
            }
        });
        return elements;
    }

    public static getTerminalsFromPartDocument(documentData: IDocumentData) {
        const terminals = new Map<string, ITerminalData>();
        documentData.elements.forEach((element) => {
            const property = element
                .part_version_data_cache
                .properties
                .get(PartStorageHelper.partPropertyKeys.category);
            if (property && property.value === PartStorageHelper.partPropertyCategories.terminal) {
                const terminal = {
                    uid: element.uid,
                    name: element.label || "",
                    type: element.properties.get(PartStorageHelper.partPropertyKeys.partType)?.value || "",
                } as ITerminalData;

                terminals.set(terminal.uid, terminal);
            }
        });

        return terminals;
    }

    public static getSelectedSubjectsData(document: IDocumentData, subjectsUids: string[]) {
        const selectedElementsData: IElementData[] = [];
        const selectedRoutesData: IRouteData[] = [];

        subjectsUids.forEach((selectedSubjectUid: string) => {
            const elementData = document.elements.get(selectedSubjectUid);

            if (elementData !== undefined) {
                selectedElementsData.push(elementData);
            }

            const routeData = document.routes.get(selectedSubjectUid);

            if (routeData) {
                selectedRoutesData.push(routeData);
            }
        });
        return {selectedElementsData, selectedRoutesData};
    }

    public static addElement(documentData: IDocumentData, element: IElementData) {
        documentData.elements.set(element.uid, element);
    }

    public static deleteElements(documentData: IDocumentData, elements: IElementData[]) {
        elements.forEach((elementToDelete: IElementData) => {
            const routesToDelete: Set<IRouteData> = new Set();
            // TODO@Chris switch this to Terminals
            documentData.routes.forEach((route: IRouteData, id) => {
                if (route.endpoints.start_element_terminal.element_uid === elementToDelete.uid ||
                    route.endpoints.end_element_terminal.element_uid === elementToDelete.uid) {
                    routesToDelete.add(route);
                }
            });
            this.deleteRoutes(documentData, Array.from(routesToDelete));
            documentData.elements.delete(elementToDelete.uid);
        });
    }

    public static deleteRoutes(documentData: IDocumentData, routes: IRouteData[]) {
        routes.forEach((routeToDelete: IRouteData) => {
            documentData.routes.delete(routeToDelete.uid);
        });
    }

    public static restoreNewElementConnections(
        documentData: IDocumentData,
        newElement: IElementData,
        connections: IConnection[],
        currentUser: IUserData,
    ) {
        connections.forEach((connection: IConnection) => {
            if (connection.type === ConnectionType.looseRoute) {
                this.connectNewPartTerminalsToHostDocumentElements(documentData, connection, newElement, currentUser);
            } else if (connection.type === ConnectionType.looseElementTerminal) {
                this.connectLooseHostDocumentRoutesToNewPartTerminals(
                    documentData,
                    connection,
                    newElement,
                    currentUser,
                );
            }
        });
    }

    public static rotateElement(documentData: IDocumentData, elements: IElementData[]) {
        elements.forEach((element: IElementData) => {
            const elementToRotate = this.elementExistsInDocument(documentData, element);

            if (elementToRotate) {

                if (!elementToRotate.diagram_position.flip) {
                    elementToRotate.diagram_position.orientation =
                    (elementToRotate.diagram_position.orientation || 0) - getRotationStep();
                } else {
                    elementToRotate.diagram_position.orientation =
                    (elementToRotate.diagram_position.orientation || 0) + getRotationStep();
                }

            }
        });
    }

    public static flipElements(documentData: IDocumentData, elements: IElementData[]) {
        elements.forEach((element: IElementData) => {
            const elementToFlip = this.elementExistsInDocument(documentData, element);

            if (elementToFlip) {
                if (!elementToFlip.diagram_position.flip) {
                    elementToFlip.diagram_position.flip = true;
                } else {
                    elementToFlip.diagram_position.flip = !elementToFlip.diagram_position.flip;
                }
            }
        });
    }

    public static documentIsPart(documentData: IDocumentData, part: IPartData | undefined) {
        if (documentData.belongs_to_part_uid && part && !part.archived) {
            return true;
        } else {
            return false;
        }
    }

    public static areSubjectsEqual(originalSubjectData: ISubjectData | ISegmentData,
                                   updatedSubjectData: ISubjectData | ISegmentData) {
        const flatOriginalSubjectData = interfaceDataToObject(originalSubjectData);
        const flatUpdatedSubjectData = interfaceDataToObject(updatedSubjectData);

        const diff = detailedDiff(flatOriginalSubjectData, flatUpdatedSubjectData) as any;

        return this.isEmptyObject(diff.added) && this.isEmptyObject(diff.updated) && this.isEmptyObject(diff.deleted);
    }

    private static baseNameGeneratorConfig: Config = {
        dictionaries: [adjectives, colors, scifyDevices],
        separator: " ",
        style: "capital",
    };

    private static isEmptyObject(object: ISubjectData | ISegmentData) {
        return Object.entries(object).length === 0 && object.constructor === Object;
    }

    private static connectLooseHostDocumentRoutesToNewPartTerminals(documentData: IDocumentData,
                                                                    connection: IConnection,
                                                                    newElement: IElementData,
                                                                    currentUser: IUserData) {

        if (connection.partDocumentTerminal.uid && connection.looseElementTerminal) {
            const newRoute = this.createNewRouteData(
                newElement.uid,
                connection.partDocumentTerminal.uid,
                connection.looseElementTerminal.elementUid,
                connection.looseElementTerminal.uid,
                currentUser.uid);

            documentData.routes.set(newRoute.uid, newRoute);
        }
    }

    private static connectNewPartTerminalsToHostDocumentElements(documentData: IDocumentData,
                                                                 connection: IConnection,
                                                                 newElement: IElementData,
                                                                 currentUser: IUserData) {
        if (connection.looseRouteTerminal && connection.partDocumentTerminal.uid) {
            const newRoute = this.createNewRouteData(
                newElement.uid,
                connection.partDocumentTerminal.uid,
                connection.looseRouteTerminal.connectedTo.elementUid,
                connection.looseRouteTerminal.connectedTo.terminalUid,
                currentUser.uid);

            documentData.routes.set(newRoute.uid, newRoute);
        }
    }

    private static elementExistsInDocument(documentData: IDocumentData, element: IElementData) {
        return documentData
            .elements
            .get(element.uid);
    }

    private static createSlug(name: string) {
        return Slugify(name, {remove: /[*+~.()'"!:@]/g}).toLowerCase();
    }
}
