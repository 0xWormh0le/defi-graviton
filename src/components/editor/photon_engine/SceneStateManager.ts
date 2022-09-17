import { Guid } from "guid-typescript";
import {Group, Line, Mesh, Object3D, Vector3} from "three";
import {DocumentStorageHelper} from "../../storage_engine/helpers/DocumentStorageHelper";
import { PartStorageHelper } from "../../storage_engine/helpers/PartStorageHelper";
import {
    deepCopy,
    IDocumentData,
    IDocumentPropertyData,
    IElementData,
    IRouteData,
    ISegmentData,
    ISubjectData,
    ITerminalData,
    IUserData,
} from "../../storage_engine/models/FirebaseDataModels";
import { IElementAndTerminal } from "./controls/PhotonRouteControls";
import BaseRouteSubject from "./scene_subjects/BaseRouteSubject";
import BaseSubject, {SubjectType} from "./scene_subjects/BaseSubject";
import ModuleSubject from "./scene_subjects/ModuleSubject";
import RouteSubject from "./scene_subjects/RouteSubject";
import SegmentSubject from "./scene_subjects/SegmentSubject";
import StandardSymbolSubject from "./scene_subjects/StandardSymbolSubject";
import SceneManager from "./SceneManager";

class SceneStateManager {

    get selectableSceneSubjects() {
        return this.sceneManager.sceneSubjects.filter((subject: BaseSubject) => subject.isSelectable);
    }

    public currentUserData: IUserData;
    private currentDocumentData: IDocumentData | null = null;
    private readonly sceneManager: SceneManager;
    private documentLoaded = false;
    private _startingTerminal: IElementAndTerminal | null = null;

    constructor(sceneManager: SceneManager, currentUserData: IUserData) {
        this.sceneManager = sceneManager;
        this.currentUserData = currentUserData;
    }

    public async loadDocument(documentData: IDocumentData) {
        if (!documentData) {
            throw new Error("Error loading document.");
        }

        this.documentLoaded = false;

        this.resetDocument();

        this.currentDocumentData = documentData;

        this.sceneManager.photonNavigationControls.loadStateFromDocument();

        await this.createElements();

        await this.createRoutes();

        this.documentLoaded = true;
    }

    public async updateDocument(updatedDocumentData: IDocumentData) {
        if (!this.currentDocumentData) {
            throw new Error("You need to first load a document using the loadDocument method.");
        }
        if (this.currentDocumentData.uid !== updatedDocumentData.uid) {
            throw new Error("Use the loadDocument method to load a different document.");
        }

        if (!this.documentLoaded) {
            console.error("Attempted to update document before finished loading");
            return;
        }

        this.destroyDeletedRoutes(updatedDocumentData);

        this.destroyDeletedElements(updatedDocumentData);

        await this.createOrUpdateElements(updatedDocumentData);

        await this.createOrUpdateRoutes(updatedDocumentData);

        this.currentDocumentData = deepCopy(updatedDocumentData);
    }

    public addSubjects(subjectsData: ISubjectData[],
                       updateDocumentChanges: boolean = true,
                       notifyReact = false) {
        const promises: Array<Promise<void>> = [];
        subjectsData.forEach((subjectData) => {
            const promise = this.addSubject(subjectData, updateDocumentChanges, notifyReact);
            if (promise) {
                promises.push(promise);
            }
        });

        return Promise.all(promises);
    }

    public addSubject(subjectData: ISubjectData,
                      updateDocumentChanges: boolean = true,
                      notifyReact = false) {
        let promise;

        if (DocumentStorageHelper.isElementData(subjectData)) {
            this.convertToSceneCoordinates(subjectData);
            promise = this.addElementToScene(subjectData);
        } else if (DocumentStorageHelper.isRouteData(subjectData)) {
            promise = this.addRouteToScene(subjectData);
        }

        return promise?.then(() => {
            this.propagateState(updateDocumentChanges, notifyReact);
        });
    }

    public destroySubjectsByUid(subjectUids: string[], updateDocumentChanges: boolean = true, notifyReact = false) {
        subjectUids.forEach((subjectUid) => {
            this.destroySubjectByUid(subjectUid, false, false);
        });

        this.propagateState(updateDocumentChanges, notifyReact);
    }

    public destroySubjectByUid(subjectUid: string, updateDocumentChanges: boolean = true, notifyReact = false) {
        const subject = this.findSubjectByUid(subjectUid);

        if (subject) {
            this.destroySubject(subject, updateDocumentChanges, notifyReact);
        }
    }

    public destroySubject(subject: BaseSubject, updateDocumentChanges: boolean = true, notifyReact = false) {
        const subjectUid = subject.subjectUid;

        if (subject.subjectType === SubjectType.Element) {
            this.destroyElementRoutes(subjectUid);
        } else if (subject.subjectType === SubjectType.Route) {
            this.destroySegmentOrRoute(subject);
        }

        subject.destroy();

        const index = this.sceneManager
            .sceneSubjects.findIndex((sceneSubject) => sceneSubject.subjectUid === subjectUid);

        if (index > -1) {
            this.sceneManager.sceneSubjects.splice(index, 1);
        }

        this.propagateState(updateDocumentChanges, notifyReact);
    }

    public getSubjectsByType(subjectTypeFilter: SubjectType) {
        return this.sceneManager
            .sceneSubjects
            .filter((subject) => subject.subjectType === subjectTypeFilter);
    }

    public findSubjectByUid(subjectUid: string) {
        return this.sceneManager
            .sceneSubjects
            .find((subject) => subject.subjectUid === subjectUid);
    }

    public findSubjectIndexByUid(subjectUid: string) {
        return this.sceneManager
            .sceneSubjects
            .findIndex((subject) => subject.subjectUid === subjectUid);
    }

    public findSubjectByObject3dUuid(object3dUuid: string) {
        return this.selectableSceneSubjects.find((subject) =>
            subject.clickTarget && subject.clickTarget.uuid === object3dUuid);
    }

    public findSubjectByObject3d(object3d: Object3D | Mesh | Group | Line) {
        return this.sceneManager.sceneSubjects.find((subject) =>
            subject.sceneObject && subject.clickTarget && subject.clickTarget.uuid === object3d.uuid);
    }

    public findSubjectIndexByObject3dUuid(object3dUuid: string) {
        return this.sceneManager.sceneSubjects.findIndex((subject) => {
            const doesIdMatch = subject.clickTarget?.uuid === object3dUuid;
            return subject.sceneObject && ( doesIdMatch || subject.sceneObject.uuid === object3dUuid);
        });

    }

    public updateDocumentData(notifyReact = false) {
        if (!this.currentDocumentData) {
            throw new Error("currentDocumentData is not set");
        }

        const document = this.currentDocumentData;

        document.elements = new Map<string, IElementData>();
        document.routes = new Map<string, IRouteData>();

        this.sceneManager.sceneSubjects.forEach((subject) => {
            if (DocumentStorageHelper.isElementData(subject.getSubjectData())) {
                const elementData = subject.getSubjectData() as IElementData;
                document.elements.set(elementData.uid, elementData);
            } else if (DocumentStorageHelper.isRouteData(subject.getSubjectData())) {
                if (subject.subjectType === SubjectType.RouteSegment) {
                    return;
                }
                const routeData = subject.getSubjectData() as IRouteData;
                document.routes.set(routeData.uid, routeData);
            }
        });

        this.currentDocumentData = document;

        if (notifyReact) {
            this.sceneManager.updateMethod(this.currentDocumentData);
        }
    }

    public setOrUpdateDocumentProp(
        propertyKey: string,
        propertyValue: string | number | boolean | {},
        propertySection?: string) {
        if (!this.currentDocumentData) {
            return;
        }

        let property = this.currentDocumentData.properties.get(propertyKey);

        if (!property || (property.user_uid !== this.currentUserData.uid &&
            property.section !== propertySection)) {
            property = {
                user_uid: this.currentUserData.uid,
                section: propertySection,
                key: propertyKey,
                value: propertyValue,
            } as IDocumentPropertyData;
        } else {
            property.value = propertyValue;
        }
        this.currentDocumentData.properties.set(property.key, property);

        this.updateDocumentData(true);
    }

    public findDocumentProperty(propertyKey: string, propertySection?: string) {
        if (!this.currentDocumentData) {
            return;
        }
        if (!this.currentDocumentData.properties) {
            return;
        }
        const property = this.currentDocumentData.properties.get(propertyKey);
        if (!property || (property.user_uid !== this.currentUserData.uid && property.section !== propertySection)) {
            return undefined;
        }
        return property;
    }

    public getSelectedSubjects() {
        return this.selectableSceneSubjects.filter((subject) => subject.isSelected);
    }

    public propagateSelectedSubjectsState() {
        const selectedSubjectsUids = this.getSelectedSubjects().map((subject) => subject.subjectUid);
        this.sceneManager.selectedSubjectsMethod(selectedSubjectsUids);
    }

    public selectSubject(subjects: BaseSubject, dontPropagate: boolean = false) {
        this.selectSubjects([subjects], dontPropagate);
    }

    public unselectSubject(subjects: BaseSubject, dontPropagate: boolean = false) {
        this.unselectSubjects([subjects], dontPropagate);
    }

    public selectSubjects(selectedSubjects: BaseSubject[], dontPropagate: boolean = false) {
        const selectableSelectedSubjects = this.getSelectableSubjects(selectedSubjects);
        this.selectableSceneSubjects.forEach((subject) => {
            if (selectableSelectedSubjects
                .find((selectedSubject) => selectedSubject.subjectUid === subject.subjectUid)) {
                subject.setSelected();
            }
        });

        if (!dontPropagate) {
            this.propagateSelectedSubjectsState();
        }
    }

    public selectAllSubjects() {
        this.selectSubjects(this.selectableSceneSubjects);
    }

    public getSelectableSubjects(selectedSubjects: BaseSubject[]) {
        return selectedSubjects.filter((subject) => subject && subject.isSelectable);
    }

    public selectSubjectsByUids(subjectsUids: string[], dontPropagate: boolean = false) {
        const subjects = subjectsUids.map((subjectUid) => this.findSubjectByUid(subjectUid)) as BaseSubject[];
        this.selectSubjects(subjects, dontPropagate);
    }

    public unselectSubjects(subjects: BaseSubject[], dontPropagate: boolean = false) {
        subjects.filter((subject) => subject.isSelectable).forEach((subject) => {
            subject.setUnselected();
        });

        if (!dontPropagate) {
            this.propagateSelectedSubjectsState();
        }
    }

    public unselectAllSubjects(dontPropagate: boolean = false) {
        this.unselectSubjects(this.selectableSceneSubjects, dontPropagate);
    }

    public deleteSelectedSubjects() {
        const elementUidsToBeDeleted = this.getSelectedSubjects()
            .filter((subject) => subject.subjectType === SubjectType.Element)
            .map((subject) => subject.subjectUid);
        const routeUidsToBeDeleted = this.getSelectedSubjects()
            .filter((subject) => subject.subjectType === SubjectType.Route)
            .map((subject) => subject.subjectUid);

        this.destroySubjectsByUid(routeUidsToBeDeleted);
        this.destroySubjectsByUid(elementUidsToBeDeleted);

        this.propagateState(true, true);

        this.propagateSelectedSubjectsState();
    }

    public set startingTerminal(value: IElementAndTerminal | null) {
        this._startingTerminal = value;
    }

    public get startingTerminal(): IElementAndTerminal | null {
        return this._startingTerminal;
    }

    public createRoutingFromTerminalToRoutePoint(startingTerminal: IElementAndTerminal,
                                                 intersected: Mesh, point: Vector3) {
        const subject = this.findSubjectByObject3d(intersected) as SegmentSubject;
        const routeSubject = this.findSubjectByUid(subject.getSubjectData().route_uid) as RouteSubject;
        const positionV2 = PartStorageHelper.createElementPosition(true, point.x, point.y);
        const terminalUid = Guid.create().toString();
        const branchData = DocumentStorageHelper.createBranchElementData(positionV2, this.currentUserData.uid);
        const terminal1 = {
            uid: terminalUid,
            position: positionV2,
        } as ITerminalData;
        branchData.part_version_data_cache.terminals.set(terminalUid, terminal1);

        this.addSubject(branchData);

        const branchPoint = new Vector3(point.x, point.y, point.z);
        if (subject.getSubjectData().terminalEndPosition.x === subject.getSubjectData().terminalStartPosition.x) {
            branchPoint.setX(subject.getSubjectData().terminalStartPosition.x);
        } else {
            branchPoint.setY(subject.getSubjectData().terminalStartPosition.y);
        }

        const route1 = DocumentStorageHelper.createNewRouteDataForBranchPoint(
            routeSubject.elementA?.getSubjectData().uid as string,
            routeSubject.terminalA?.terminalData.uid as string,
            branchData.uid,
            terminalUid,
            routeSubject,
            subject,
            branchPoint,
            this.currentUserData.uid,
        );
        const route2 = DocumentStorageHelper.createNewRouteDataForBranchPoint(
            routeSubject.elementB?.getSubjectData().uid as string,
            routeSubject.terminalB?.terminalData.uid as string,
            branchData.uid,
            terminalUid,
            routeSubject,
            subject,
            branchPoint,
            this.currentUserData.uid,
        );

        const route3 = DocumentStorageHelper.createNewRouteDataToBranchPoint(
            this.startingTerminal?.element_data as IElementData,
            this.startingTerminal?.terminal_data as ITerminalData,
            branchData.uid,
            terminalUid,
            branchPoint,
            subject,
            this.currentUserData.uid,
        );

        this.addSubjects([route1, route2, route3]);

        this.destroySubjectByUid(routeSubject.subjectUid, false, false);

        this.propagateState(true, true);
    }

    private createOrUpdateRoutes(updatedDocumentData: IDocumentData) {
        const promises: Array<Promise<void>> = [];
        updatedDocumentData.routes.forEach((route) => {
            const promise = this.addSubjectOrUpdateExisting(route, true);
            if (promise) {
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    }

    private createOrUpdateElements(updatedDocumentData: IDocumentData) {
        const promises: Array<Promise<void>> = [];
        updatedDocumentData.elements.forEach((element) => {
            const promise = this.addSubjectOrUpdateExisting(element, true);
            if (promise) {
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    }

    private addSubjectOrUpdateExisting(subjectData: ISubjectData,
                                       skipUpdatingDocumentChanges: boolean = false) {
        const existingSubject = this.findSubjectByUid(subjectData.uid);

        if (existingSubject) {
            this.updateSubject(subjectData, skipUpdatingDocumentChanges);
        } else {
            return this.addSubject(subjectData, skipUpdatingDocumentChanges);
        }
    }

    private updateSubject(subjectData: ISubjectData, updateDocumentChanges: boolean = true) {
        const sceneSubject = this.findSubjectByUid(subjectData.uid);

        if (!sceneSubject) {
            return;
        }

        const existingSubjectData = sceneSubject.getSubjectData();

        if (!existingSubjectData ||
            (existingSubjectData && !DocumentStorageHelper.areSubjectsEqual(subjectData, existingSubjectData))) {
            sceneSubject.updateFromData(subjectData);
            this.propagateState(updateDocumentChanges, false);
        }
    }

    private destroyDeletedRoutes(updatedDocumentData: IDocumentData) {
        const self = this;
        this.getSubjectsByType(SubjectType.Route).forEach((subject) => {
            const routeSubject = subject as BaseRouteSubject;
            if (routeSubject.subjectType === SubjectType.RouteSegment) {
                return;
            }
            const routeExists = updatedDocumentData
                .routes.get(routeSubject.subjectUid);

            if (!routeExists) {
                self.destroySubjectByUid(routeSubject.subjectUid, true);
            }
        });
    }

    private destroyDeletedElements(updatedDocumentData: IDocumentData) {
        const self = this;
        this.getSubjectsByType(SubjectType.Element).forEach((subject) => {
            const elementExists = updatedDocumentData
                .elements.get(subject.subjectUid);

            if (!elementExists) {
                self.destroySubjectByUid(subject.subjectUid, true);
            }
        });
    }

    private createRoutes() {
        const self = this;
        const promises: Array<Promise<void>> = [];
        this.currentDocumentData?.routes.forEach((route) => {
            const promise = self.addSubject(route, false);

            if (promise) {
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    }

    private createElements() {
        const promises: Array<Promise<void>> = [];
        this.currentDocumentData?.elements.forEach((element) => {
            const promise = this.addSubject(element, false, false);

            if (promise) {
                promises.push(promise);
            }
        });

        return Promise.all(promises);
    }

    private propagateState(updateDocumentChanges: boolean, notifyReact: boolean) {
        if (updateDocumentChanges) {
            this.updateDocumentData(notifyReact);
        }
    }

    private addRouteToScene(subjectData: IRouteData) {
        return new Promise((resolve) => {
            const newRouteSubject = new RouteSubject(this.sceneManager, subjectData);
            this.sceneManager.sceneSubjects.push(newRouteSubject);
            resolve();
        });
    }

    private addElementToScene(subjectData: IElementData) {
        let newElementSubject: StandardSymbolSubject | ModuleSubject;
        if (subjectData.part_version_data_cache.symbol_resource_file) {
            newElementSubject = new StandardSymbolSubject(this.sceneManager.scene, subjectData);
            this.sceneManager.sceneSubjects.push(newElementSubject);
        } else {
            newElementSubject = new ModuleSubject(this.sceneManager.scene, subjectData);
            this.sceneManager.sceneSubjects.push(newElementSubject);
        }

        return newElementSubject.create();
    }

    private destroySegmentOrRoute(subject: BaseSubject) {
        if (subject.subjectType === SubjectType.RouteSegment) {
            // If deleted a segment, delete the complete route
            this.destroySubjectByUid((subject.getSubjectData() as ISegmentData).route_uid);
        } else {
            // Delete route and its segments
            (subject as RouteSubject).getSegments().forEach((segment) => {
                segment.destroy();
                const index = this.sceneManager
                    .sceneSubjects
                    .findIndex((sceneSubject) => sceneSubject.subjectUid === segment.subjectUid);

                if (index > -1) {
                    this.sceneManager.sceneSubjects.splice(index, 1);
                }
            });
        }

    }

    private resetDocument() {
        const self = this;

        this.getSubjectsByType(SubjectType.Route).forEach((routeSubject) => {
            self.destroySubjectByUid(routeSubject.subjectUid, true);
        });

        this.getSubjectsByType(SubjectType.Element).forEach((elementSubject) => {
            self.destroySubjectByUid(elementSubject.subjectUid, true);
        });

        this.currentDocumentData = null;

        this.sceneManager.photonNavigationControls.resetState();
    }

    private destroyElementRoutes(subjectUid: string) {
        const routes = this.getSubjectsByType(SubjectType.Route);

        routes.forEach((subject) => {
            const route = subject as RouteSubject;
            if (route.subjectType === SubjectType.RouteSegment) {
                return;
            }
            if (route.elementA?.subjectUid === subjectUid ||
                route.elementB?.subjectUid === subjectUid) {
                this.destroySubjectByUid(route.subjectUid);
            }
        });
    }

    private convertToSceneCoordinates(elementData: IElementData) {
        if (elementData.diagram_position.scene_cursor_position === false) {

            const worldMousePosition = this.sceneManager.getSceneMousePosition(
                elementData.diagram_position.x,
                elementData.diagram_position.y,
            );

            elementData.diagram_position.x = worldMousePosition.x;
            elementData.diagram_position.y = worldMousePosition.y;

            elementData.diagram_position.scene_cursor_position = true;
        }
    }
}

export default SceneStateManager;
