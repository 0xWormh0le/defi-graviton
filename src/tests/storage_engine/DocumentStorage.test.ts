/*
import {DocumentStorage} from "../../components/storage_engine/DocumentStorage";

test("DocumentStorage Setup Test", () => {
    const documentId = "test_document";
    const clientId = "test_id";

    const storage = new DocumentStorage(documentId, clientId);
    expect(true);
});

 */

// @ts-ignore
class Pos {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

}

interface IValue {
    name: string;
    val: boolean | string | number;
}

// Todo make sure it retrieves all properties including the inherited ones and protected ones.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
function retrievePropEntries(obj: any): IValue[] {
    return retrieveProps(obj, [], []);
}

function retrieveProps(obj: any, parentName: string[], names: IValue[]): IValue[] {
    for (const en of Object.entries(obj)) {
        if (typeof(en[1]) === typeof({a: 1})) {
            const nextName = parentName.concat([en[0]]);
            if (Object.prototype.toString.call(en[1]) === "[object Array]") {
                // @ts-ignore
                for (const muh of en[1]) {
                    names.concat(retrieveProps(muh, nextName, names));
                }
            } else {
                names.concat(retrieveProps(en[1], nextName, names));
            }
        } else {
            let entryName: string = "";
            for (const n of parentName) {
                entryName += n + ".";
            }
            entryName += en[0];
            names.push({name: entryName, val: en[1]} as IValue);
        }
    }
    return names;
}

test("Parsing things test", () => {
    const dropPosition = new Pos(5, 6);
    const userUid = "992";
    const subject = {
        diagram_position:
            {
                sceneCursorPosition: false,
                x: [{value: dropPosition.x, created_at: 0, userUid}],
                y: [{value: dropPosition.y, created_at: 0, userUid}],
            },
        part: "new_part",
        properties: [],
        uid: 123,
    };
    const result = retrievePropEntries(subject);

    const numOfProps: number = 9;
    expect(result.length).toStrictEqual(numOfProps);
});
