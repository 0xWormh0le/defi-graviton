import BaseSubject, { SubjectType } from "../editor/photon_engine/scene_subjects/BaseSubject";
import { flatObjectToInterface, interfaceDataToObject } from "./models/FirebaseDataModels";

export interface IClipboardDataContent {
    type: SubjectType;
    subject: any;
}

interface IClipboardData {
    type: string;
    data: IClipboardDataContent[];
}

const objectName = "GravitonObject";

export class Clipboard {

    public static Init(parent: any) {
        if (Clipboard.instance === undefined) {
            Clipboard.instance = new Clipboard();
            Clipboard.instance.parent = parent;
            window.addEventListener("paste", (event: Event) => {
                const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
                try {
                    const clipboardText = clipboardEvent.clipboardData ? clipboardEvent.clipboardData.getData("text") : "";
                    const parsedObject = JSON.parse(clipboardText);
                    if (parsedObject.type && parsedObject.type === objectName) {
                        if (parent.OnPaste) {
                            const deserializedData = Clipboard.instance.deserialize(parsedObject);
                            parent.OnPaste(deserializedData);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }
    }

    public static Copy(data: BaseSubject[]) {
        Clipboard.instance.copy(data);
    }

    private static instance: Clipboard;
    private parent: any;

    private serialize(data: BaseSubject[]): string {
        const dataToPut: IClipboardDataContent[] = data.map((subject) => {
            const wrapped = {
                subject: interfaceDataToObject(subject.getSubjectData()),
                type: subject.subjectType,
            };
            return wrapped;
        });
        const objectToPut = {
            type: objectName,
            data: dataToPut,
        } as IClipboardData;
        return JSON.stringify(objectToPut);
    }

    private deserialize(parsedObject: any) {
        const deserializedData = parsedObject.data.map((wrapped: any) => {
            return {
                subject: flatObjectToInterface(wrapped.subject),
                type: wrapped.type,
            };
        });
        return deserializedData;
    }

    private createOffscreenPasteTarget(textValue: string) {
        // do some tricks with textarea tag for copying into system clipboard
        // which creates a textarea and put serialized text, select all text and put to clipboard
        // that element should be invisible, but also located somewhere and focused to be copied
        const element = document.createElement("textarea");
        element.value = textValue;
        element.style.position = "absolute";
        element.style.left = "-9999px";
        document.body.appendChild(element);
        element.select();
        return element;
    }

    private copy(data: BaseSubject[]) {
        const element = this.createOffscreenPasteTarget(this.serialize(data));

        try {
            document.execCommand("copy");
        } catch (err) {
            console.error(err);
        }

        document.body.removeChild(element);
    }
}
