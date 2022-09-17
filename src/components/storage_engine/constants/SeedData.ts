import {GENESIS_TERMINAL_PART_UID} from "../../../constants/genesisTerminalPartUid";
import {PartStorageHelper} from "../helpers/PartStorageHelper";
import {IDocumentData, IPartVersionData, IPropertyData, ITerminalData, IUserData} from "../models/FirebaseDataModels";

class SeedData {
    public parts: Map<string, IPartVersionData> = new Map();
    public documents: IDocumentData[] = [];
    public resistorPart: IPartVersionData;
    public specificResistorPart: IPartVersionData;
    public crystalPart: IPartVersionData;
    public inductorPart: IPartVersionData;
    public diodePart: IPartVersionData;
    public capacitorPart: IPartVersionData;
    public batteryPart: IPartVersionData;
    public andGatePart: IPartVersionData;
    public spdtRelayPart: IPartVersionData;
    public modulePart: IPartVersionData;
    public arduinoPart: IPartVersionData;
    public adafruitATSAMD21Part: IPartVersionData;
    public towerProSG92RMicroServoPart: IPartVersionData;
    public ledPart: IPartVersionData;
    public terminalPart: IPartVersionData | undefined;
    public newModuleDoc: IDocumentData;
    public userData: IUserData;

    constructor() {

        const currentDate = new Date();

        this.userData = {
            uid: "auth0|5e1fa10cd35ca40e94f2fcfc",
            full_name: "Matthias Wagner",
            handle: "Natarius",
            email: "matthias@defygraviityinc.com",
            isAnonymous: false,
            picture: "https://s.gravatar.com/avatar/18131eb07a61b81e9044a23fc7e3a388?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fma.png",
        };

        this.resistorPart = {
            part_uid: "025bf3e4-01dd-41bb-a177-c0a31607d565",
            owner_uid: this.userData.uid,
            name: "Resistor",
            version: PartStorageHelper.headVersionName,
            description: "A good resistor",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 1000, unit: "Ω"}],
            ]),
            symbol_resource_file: "v1/passive/resistor.glb",
            preview_image: "v1/passive/resistor.svg",
            terminals: new Map([
                ["025af3e4-01dd-41bb-a177-c0a31607d565", {
                    uid: "025af3e4-01dd-41bb-a177-c0a31607d565",
                    position: {
                        x: -15.5,
                        y: -5.7,
                    },
                }],
                ["025bf3e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01ad-41bb-a177-c0a31607d565",
                    position: {
                        x: 15.5,
                        y: -5.7,
                    },
                },
            ]]),
        };

        this.specificResistorPart = {
            part_uid: "042bf3e4-01dd-41bb-a177-c0a31607d557",
            owner_uid: this.userData.uid,
            name: "ERJ-A1AJ102U",
            version: PartStorageHelper.headVersionName,
            description: "RES SMD 1K OHM 1.33W 2512 WIDE",
            detailed_description: "1 kOhms ±5% 1.33W Chip Resistor Wide 2512 (6432 Metric), 1225 Convex Automotive AEC-Q200, Current Sense Thick Film",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 1000, unit: "Ω"}],
                ["digikey_part_number", {key: "digikey_part_number", value: "ERJ-A1AJ102U-ND"}],
                ["newark_part_number", {key: "newark_part_number", value: "40P0049"}],
                ["onlinecomponents_part_number", {key: "onlinecomponents_part_number", value: "ERJ-A1AJ102U"}],
                ["Panasonic Electronic Components", {key: "manufacturer", value: "Panasonic Electronic Components"}],
                [PartStorageHelper.partPropertyKeys.category, {
                    key: PartStorageHelper.partPropertyKeys.category,
                    value: "Resistor",
                }],
            ]),
            symbol_resource_file: "v1/passive/resistor.glb",
            preview_image: "v1/passive/resistor.svg",
            terminals: new Map([
                ["024af3e4-01dd-41bb-a177-c0a31607d567", {
                    uid: "024af3e4-01dd-41bb-a177-c0a31607d567",
                    position: {
                        x: -15.5,
                        y: -5.7,
                    },
                }],
                ["045bf3e4-01ad-41bb-a177-c0a31677d565", {
                    uid: "045bf3e4-01ad-41bb-a177-c0a31677d565",
                    position: {
                        x: 15.5,
                        y: -5.7,
                    },
                }],
            ]),
        };

        this.crystalPart = {
            part_uid: "025bf3e4-01dd-41aa-a177-c0a31607d565",
            owner_uid: this.userData.uid,
            name: "Crystal Oscillator",
            version: PartStorageHelper.headVersionName,
            description: "A slow Crystal Oscillator",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 500, unit: "Hz"},
                ]]),
            symbol_resource_file: "v1/passive/crystal.glb",
            terminals: new Map([
                ["025af3e4-01dd-41bb-a177-c0a31607d565", {
                    uid: "025af3e4-01dd-41bb-a177-c0a31607d565",
                    position: {
                        x: -15,
                        y: -6.5,
                    },
                }],
                ["025bf3e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01ad-41bb-a177-c0a31607d565",
                    position: {
                        x: 15,
                        y: -6.5,
                    },
                }],
            ]),
        };

        this.inductorPart = {
            part_uid: "025bf3e1-21dd-41aa-a177-c0a31607d565",
            owner_uid: this.userData.uid,
            name: "Standard Inductor",
            version: PartStorageHelper.headVersionName,
            description: "A Standard Inductor",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 1.5, unit: "mH"},
                ]]),
            symbol_resource_file: "v1/passive/inductor.glb",
            terminals: new Map([
                ["025af3e4-01dd-41bb-a177-c0a31607d565", {
                    uid: "025af3e4-01dd-41bb-a177-c0a31607d565",
                    position: {
                        x: -15,
                        y: -10,
                    },
                }],
                ["025bf3e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01ad-41bb-a177-c0a31607d565",
                    position: {
                        x: 16,
                        y: -10,
                    },
                }],
            ]),
        };

        this.spdtRelayPart = {
            part_uid: "025bf3e4-22dd-41bb-a177-c0a31607d565",
            owner_uid: this.userData.uid,
            name: "SPDT Relay",
            version: PartStorageHelper.headVersionName,
            description: "A SPDT relay",
            created_at: currentDate.getTime(),
            properties: new Map(),
            symbol_resource_file: "spdt_relay_symbol.svg",
            terminals: new Map([
                ["025af3e4-01dd-41bb-a177-c0a31607d565", {
                    uid: "025af3e4-01dd-41bb-a177-c0a31607d565",
                    name: "1",
                    position: {
                        x: 0.5,
                        y: -8,
                    },
                }],
                ["015bf3e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "015bf3e4-01ad-41bb-a177-c0a31607d565",
                    name: "2",
                    position: {
                        x: 28.5,
                        y: -8,
                    },
                }],
                ["075bf3e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "075bf3e4-01ad-41bb-a177-c0a31607d565",
                    name: "T",
                    position: {
                        x: 14.5,
                        y: -98,
                    },
                }],
                ["075bf4e4-01ad-41bb-a177-c0a31607d565", {
                    uid: "075bf4e4-01ad-41bb-a177-c0a31607d565",
                    name: "A",
                    position: {
                        x: -14.5,
                        y: -8,
                    },
                }],
                ["075bf3e8-01ad-41bb-a177-c0a31607d565", {
                    uid: "075bf3e8-01ad-41bb-a177-c0a31607d565",
                    name: "B",
                    position: {
                        x: -14.5,
                        y: -98,
                    },
                }],
            ]),
        };

        this.andGatePart = {
            part_uid: "025bf3e4-01dd-41bb-a177-c0a33637d565",
            owner_uid: this.userData.uid,
            name: "AND Gate",
            version: "0.0.2",
            description: "A good gate",
            created_at: currentDate.getTime(),
            properties: new Map(),
            symbol_resource_file: "and_gate_symbol.svg",
            terminals: new Map([
                ["725af5e4-01dd-41bb-a177-c0a31607d565", {
                    uid: "725af5e4-01dd-41bb-a177-c0a31607d565",
                    name: "A",
                    position: {
                        x: -40,
                        y: -22,
                    },
                }],
                ["023bf3e4-51ad-41bb-a177-c0a31607d565", {
                    uid: "023bf3e4-51ad-41bb-a177-c0a31607d565",
                    name: "B",
                    position: {
                        x: -40,
                        y: -58,
                    },
                }],
                ["023bf3e4-51ad-41bb-a133-c0a31607d565", {
                    uid: "023bf3e4-51ad-41bb-a133-c0a31607d565",
                    name: "C",
                    position: {
                        x: 50,
                        y: -40,
                    },
                }],
            ]),
        };

        this.diodePart = {
            part_uid: "025bf3e4-01dd-41bb-a177-c0a31607d564",
            owner_uid: this.userData.uid,
            name: "Diode",
            version: PartStorageHelper.headVersionName,
            description: "A better Diode",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 5, unit: "V"}],
            ]),
            symbol_resource_file: "diode_symbol.svg",
            terminals: new Map([
                ["025bf3e4-01dd-42bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01dd-42bb-a177-c0a31607d565",
                    name: "Anode",
                    label_alignment: "right",
                    position: {
                        x: -30,
                        y: -10,
                    },
                }],
                ["025bf3e4-01dd-41bb-a177-c1a31607d565", {
                    uid: "025bf3e4-01dd-41bb-a177-c1a31607d565",
                    name: "Cathode",
                    position: {
                        x: 30,
                        y: -10,
                    },
                }],
            ]),
        };

        this.capacitorPart = {
            part_uid: "025bf3e4-01dd-41bb-a177-c0a31607d264",
            owner_uid: this.userData.uid,
            name: "Capacitor",
            version: PartStorageHelper.headVersionName,
            description: "A worse Capacitor",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 10, unit: "C"}],
            ]),
            symbol_resource_file: "v1/passive/capacitor.glb",
            terminals: new Map([
                ["025bf3e4-01dd-41bb-a137-c0a31607d565", {
                    uid: "025bf3e4-01dd-41bb-a137-c0a31607d565",
                    name: "positive",
                    position: {
                        x: -15,
                        y: -6.5,
                    },
                }],
                ["025bf3e4-01aa-41bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01aa-41bb-a177-c0a31607d565",
                    name: "negative",
                    position: {
                        x: 15,
                        y: -6.5,
                    },
                }],
            ]),
        };

        this.batteryPart = {
            part_uid: "025bf3e4-01dd-41bb-a177-c0a31657d264",
            owner_uid: this.userData.uid,
            name: "Battery",
            version: PartStorageHelper.headVersionName,
            description: "A nice Battery",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: "5", unit: "V"}],
            ]),
            symbol_resource_file: "battery_symbol.svg",
            terminals: new Map([
                ["025bf3e4-01dd-41bb-a137-c0a32607d565", {
                    uid: "025bf3e4-01dd-41bb-a137-c0a32607d565",
                    name: "positive",
                    position: {
                        x: 0,
                        y: 0,
                    },
                }],
                ["025bf3e4-01aa-45bb-a177-c0a31607d565", {
                    uid: "025bf3e4-01aa-45bb-a177-c0a31607d565",
                    name: "negative",
                    position: {
                        x: 0,
                        y: -60,
                    },
                }],
            ]),
        };

        this.ledPart = {
            part_uid: "013bf3e4-01dd-41bb-a177-c0a31657d264",
            owner_uid: this.userData.uid,
            name: "LED",
            version: PartStorageHelper.headVersionName,
            description: "A shiny LED",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["value", {key: "value", value: 1.8, unit: "V"}],
            ]),
            symbol_resource_file: "led_symbol.svg",
            terminals: new Map([
                ["025bf4e4-02dd-41bb-a137-c0a32607d565", {
                    uid: "025bf4e4-02dd-41bb-a137-c0a32607d565",
                    name: "Anode",
                    label_alignment: "right",
                    position: {
                        x: -50,
                        y: -50,
                    },
                }],
                ["455bf3e4-07aa-45bb-a177-c0a31607d565", {
                    uid: "455bf3e4-07aa-45bb-a177-c0a31607d565",
                    name: "Cathode",
                    position: {
                        x: 50,
                        y: -50,
                    },
                }],
            ]),
        };

        this.newModuleDoc = {
            uid: "018bf3e4-01dd-44bb-a177-c0a31607d264",
            name: "test",
            slug: "test",
            created_at: currentDate.getTime(),
            updated_at: currentDate.getTime(),
            owner_uid: this.userData.uid,
            properties: new Map(),
            description: "",
            elements: new Map([
                ["025bf3e4-01dd-41bb-a177-c0a31601d264", {
                    uid: "025bf3e4-01dd-41bb-a177-c0a31601d264",
                    part_uid: this.resistorPart.part_uid,
                    part_version: this.resistorPart.version,
                    part_version_data_cache: this.resistorPart,
                    diagram_position:
                        {
                            x: 0,
                            y: 0,
                        },
                    properties: new Map([
                        ["value", {key: "value", value: 20, unit: "Ω"}],
                    ]),
                }],
            ]),
            routes: new Map(),
            active_users: new Map(),
            belongs_to_part_uid: "",
        } as IDocumentData;

        this.modulePart = {
            part_uid: "035bf3e4-01dd-41bb-a177-c0a31657d264",
            owner_uid: this.userData.uid,
            name: "My Module",
            version: PartStorageHelper.headVersionName,
            description: "A super Module",
            created_at: currentDate.getTime(),
            properties: new Map(),
            document_import_uid: this.newModuleDoc.uid,
            terminals: new Map([
                ["074bf4e4-02dd-41bb-a137-c0a32607d565", {
                    uid: "074bf4e4-02dd-41bb-a137-c0a32607d565",
                }],
                ["455bf3e4-07aa-43bb-a177-c7a31607d565", {
                    uid: "455bf3e4-07aa-43bb-a177-c7a31607d565",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d565", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d565",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d565",
                }],
                ["43e6bf3e4-07aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-43bb-a137-c7a31607d565",
                }],
            ]),
        };

        this.arduinoPart = {
            part_uid: "052bf3e4-01dd-41bb-a138-c0a31657d264",
            owner_uid: this.userData.uid,
            name: "Arduino Uno",
            version: PartStorageHelper.headVersionName,
            description: "Arduino Uno R3",
            created_at: currentDate.getTime(),
            properties: new Map([
                ["verical_sku", {key: "verical_sku", value: "ARDUINO UNO REV3"}],
                ["chip_one_stop_japan_sku", {key: "chip_one_stop_japan_sku", value: "C1S120500002291"}],
                ["hermes_engineering_sku", {key: "hermes_engineering_sku", value: "ARDUINO UNO REV3"}],
                ["tme_sku", {key: "tme_sku", value: "A000066"}],
                ["manufacturer", {key: "manufacturer", value: "Arduino"}],
                [PartStorageHelper.partPropertyKeys.category, {
                    key: PartStorageHelper.partPropertyKeys.category,
                    value: PartStorageHelper.partPropertyCategories.integratedCircuit,
                }],
            ]),
            terminals: new Map([
                ["074bf4e4-02dd-41bb-a137-c0a32622d565", {
                    uid: "074bf4e4-02dd-41bb-a137-c0a32622d565",
                    name: "Vin",
                    type: "Power",
                }],
                ["074bf4e4-02dd-41bb-a137-c0a32612d565", {
                    uid: "074bf4e4-02dd-41bb-a137-c0a32612d565",
                    name: "3.3V",
                    type: "Power",
                }],
                ["074bf4e4-02dd-41bb-a137-c0a32607d565", {
                    uid: "074bf4e4-02dd-41bb-a137-c0a32607d565",
                    name: "5V",
                    type: "Power",
                }],
                ["074bf4e4-02dd-41bb-a137-c0a32607d569", {
                    uid: "074bf4e4-02dd-41bb-a137-c0a32607d569",
                    name: "GND",
                    type: "Power",
                }],
                ["455bf3e4-07aa-43bb-a177-c7a31607d568", {
                    uid: "455bf3e4-07aa-43bb-a177-c7a31607d568",
                    name: "Reset",
                    type: "Reset",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d567", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d567",
                    name: "A0",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d566", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d566",
                    name: "A1",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d965", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d965",
                    name: "A2",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d865", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d865",
                    name: "A3",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d765", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d765",
                    name: "A4",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-43bb-a177-c7a31607d665", {
                    uid: "436bf3e4-07aa-43bb-a177-c7a31607d665",
                    name: "A5",
                    type: "Analog Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d565",
                    name: "Digital Pins 0",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d465", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d465",
                    name: "Digital Pins 1",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d365", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d365",
                    name: "Digital Pins 2",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d265", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d265",
                    name: "Digital Pins 3",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d165", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d165",
                    name: "Digital Pins 4",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d562", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d562",
                    name: "Digital Pins 5",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d521", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d521",
                    name: "Digital Pins 6",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31607d512", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31607d512",
                    name: "Digital Pins 7",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a37707d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a37707d565",
                    name: "Digital Pins 8",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a39507d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a39507d565",
                    name: "Digital Pins 9",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31857d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31857d565",
                    name: "Digital Pins 10",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a38207d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a38207d565",
                    name: "Digital Pins 11",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a31737d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a31737d565",
                    name: "Digital Pins 12",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-43bb-a177-c7a36507d565", {
                    uid: "43e6bf3e4-07aa-43bb-a177-c7a36507d565",
                    name: "Digital Pins 13",
                    type: "Input/Output Pins",
                }],
                ["43e6bf3e4-07aa-49bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-49bb-a137-c7a31607d565",
                    name: "0(Rx)",
                    type: "Serial",
                }],
                ["43e6bf3e4-07aa-48bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-48bb-a137-c7a31607d565",
                    name: "1(Tx)",
                    type: "Serial",
                }],
                ["43e6bf3e4-07aa-47bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-47bb-a137-c7a31607d565",
                    name: "2",
                    type: "External Interrupts",
                }],
                ["43e6bf3e4-07aa-63bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-63bb-a137-c7a31607d565",
                    name: "3",
                    type: "External Interrupts",
                }],
                ["43e6bf3e4-07aa-45bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-45bb-a137-c7a31607d565",
                    name: "3",
                    type: "PWM",
                }],
                ["43e6bf3e4-07aa-44bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-44bb-a137-c7a31607d565",
                    name: "5",
                    type: "PWM",
                }],
                ["43e6bf3e4-07aa-33bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-33bb-a137-c7a31607d565",
                    name: "6",
                    type: "PWM",
                }],
                ["43e6bf3e4-07aa-42bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-42bb-a137-c7a31607d565",
                    name: "9",
                    type: "PWM",
                }],
                ["43e6bf3e4-07aa-41bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-07aa-41bb-a137-c7a31607d565",
                    name: "11",
                    type: "PWM",
                }],
                ["43e6bf3e4-08aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-08aa-43bb-a137-c7a31607d565",
                    name: "10 (SS)",
                    type: "SPI",
                }],
                ["43e6bf3e4-05aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-05aa-43bb-a137-c7a31607d565",
                    name: "11 (MOSI)",
                    type: "SPI",
                }],
                ["43e6bf3e4-04aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-04aa-43bb-a137-c7a31607d565",
                    name: "12 (MISO)",
                    type: "SPI",
                }],
                ["43e6bf3e4-03aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-03aa-43bb-a137-c7a31607d565",
                    name: "13 (SCK)",
                    type: "SPI",
                }],
                ["43e6bf3e4-02aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-02aa-43bb-a137-c7a31607d565",
                    name: "13",
                    type: "Inbuilt LED",
                }],
                ["43e6bf3e4-01aa-43bb-a137-c7a31607d565", {
                    uid: "43e6bf3e4-01aa-43bb-a137-c7a31607d565",
                    name: "A4 (SDA)",
                    type: "TWI",
                }],
                ["41e6bf3e4-07aa-43bb-a137-c7a31607d565", {
                    uid: "41e6bf3e4-07aa-43bb-a137-c7a31607d565",
                    name: "A5 (SCA)",
                    type: "TWI",
                }],
                ["42e6bf3e4-07aa-43bb-a137-c7a31607d565", {
                    uid: "42e6bf3e4-07aa-43bb-a137-c7a31607d565",
                    name: "AREF",
                    type: "AREF",
                }],
            ]),
        };

        this.adafruitATSAMD21Part = {
            part_uid: "052bf3e4-01dd-41bb-a138-c0a31657d123",
            owner_uid: this.userData.uid,
            name: "Adafruit ATSAMD21",
            version: PartStorageHelper.headVersionName,
            description: "Adafruit Circuit Playground Express",
            created_at: currentDate.getTime(),
            properties: new Map(),
            terminals: new Map([
                ["474bf2e4-02dd-41bb-a137-c0a32622d565", {
                    uid: "474bf2e4-02dd-41bb-a137-c0a32622d565",
                    name: "3-6V",
                    type: "Power",
                }],
                ["334bf4e4-02dd-41bb-a137-c0a32612d565", {
                    uid: "334bf4e4-02dd-41bb-a137-c0a32612d565",
                    name: "3-6V",
                    type: "Power",
                }],
                ["111bf4e4-02dd-41bb-a137-c0a32607d565", {
                    uid: "111bf4e4-02dd-41bb-a137-c0a32607d565",
                    name: "GND",
                    type: "Power",
                }],
                ["666bf4e4-02dd-41bb-a137-c0a32607d569", {
                    uid: "666bf4e4-02dd-41bb-a137-c0a32607d569",
                    name: "GND",
                    type: "Power",
                }],
                ["432bf3e4-07aa-43bb-a177-c7a31607d568", {
                    uid: "432bf3e4-07aa-43bb-a177-c7a31607d568",
                    name: "GND",
                    type: "Power",
                }],
                ["777bf3e4-07aa-43bb-a177-c7a31607d568", {
                    uid: "777bf3e4-07aa-43bb-a177-c7a31607d568",
                    name: "Vout",
                    type: "Power",
                }],
                ["436bf3e1-07aa-43bb-a177-c7a31607d567", {
                    uid: "436bf3e1-07aa-43bb-a177-c7a31607d567",
                    name: "A0",
                    type: "Analog Pins",
                }],
                ["436bf3e4-27aa-43bb-a177-c7a31607d566", {
                    uid: "436bf3e4-27aa-43bb-a177-c7a31607d566",
                    name: "A1",
                    type: "Analog Pins",
                }],
                ["436bf3e4-87aa-43bb-a177-c7a31607d965", {
                    uid: "436bf3e4-87aa-43bb-a177-c7a31607d965",
                    name: "A2",
                    type: "Analog Pins",
                }],
                ["436bf3e4-07aa-13bb-a177-c7a31607d865", {
                    uid: "436bf3e4-07aa-13bb-a177-c7a31607d865",
                    name: "A3",
                    type: "Analog Pins",
                }],
                ["000bf3e4-07aa-43bb-a177-c7a31607d765", {
                    uid: "000bf3e4-07aa-43bb-a177-c7a31607d765",
                    name: "SCL/A4",
                    type: "Digital/Analog Pins",
                }],
                ["127bf3e4-07aa-43bb-a177-c7a31607d665", {
                    uid: "127bf3e4-07aa-43bb-a177-c7a31607d665",
                    name: "SDA/A5",
                    type: "Digital/Analog Pins",
                }],
                ["127bf1e4-07aa-43bb-a177-c7a31607d665", {
                    uid: "127bf1e4-07aa-43bb-a177-c7a31607d665",
                    name: "RX/A6",
                    type: "Digital/Analog Pins",
                }],
                ["127bf2e4-07aa-43bb-a177-c7a31607d665", {
                    uid: "127bf2e4-07aa-43bb-a177-c7a31607d665",
                    name: "TX/A7",
                    type: "Digital/Analog Pins",
                }],
            ]),
        };

        this.towerProSG92RMicroServoPart = {
            part_uid: "473bf3e4-01dd-41bb-a138-c0a31657d123",
            owner_uid: this.userData.uid,
            name: "Tower Pro SG92R micro servo",
            version: PartStorageHelper.headVersionName,
            description: "Adafruit Circuit Playground Express Servo",
            created_at: currentDate.getTime(),
            properties: new Map(),
            terminals: new Map([
                ["474bf2e4-02dd-41bb-a137-c0a32622d987", {
                    uid: "474bf2e4-02dd-41bb-a137-c0a32622d987",
                    name: "GND",
                    type: "Power",
                }],
                ["334bf4e4-02dd-41bb-a137-c0a32612d654", {
                    uid: "334bf4e4-02dd-41bb-a137-c0a32612d654",
                    name: "5V",
                    type: "Power",
                }],
                ["111bf4e4-02dd-41bb-a137-c0a32607d362", {
                    uid: "111bf4e4-02dd-41bb-a137-c0a32607d362",
                    name: "RX",
                    type: "PWM",
                }],
            ]),
        };

        const terminalPartUid = GENESIS_TERMINAL_PART_UID;

        if (terminalPartUid) {
            this.terminalPart = PartStorageHelper
                .createNewPartVersionData(this.userData.uid, terminalPartUid, PartStorageHelper.headVersionName, "Terminal");
            this.terminalPart.description = "Genesis Terminal";
            this.terminalPart.terminals.set("111bf4e4-02dd-41bb-a137-c0a32607d321", {
                uid: "111bf4e4-02dd-41bb-a137-c0a32607d321",
                position: {x: 15, y: -2.5},
            } as ITerminalData);
            this.terminalPart.properties = new Map<string, IPropertyData>(
                [[PartStorageHelper.partPropertyKeys.category, {
                    key: PartStorageHelper.partPropertyKeys.category,
                    value: PartStorageHelper.partPropertyCategories.terminal,
                }],
                    [PartStorageHelper.partPropertyKeys.partType, {
                        key: PartStorageHelper.partPropertyKeys.partType,
                        value: "",
                    }]],
            );
            this.terminalPart.symbol_resource_file = "assets/terminal.glb";
            this.parts.set(this.terminalPart!.part_uid, this.terminalPart!);
        }

        this.parts.set(this.resistorPart.part_uid, this.resistorPart);
        this.parts.set(this.specificResistorPart.part_uid, this.specificResistorPart);
        this.parts.set(this.crystalPart.part_uid, this.crystalPart);
        this.parts.set(this.capacitorPart.part_uid, this.capacitorPart);
        this.parts.set(this.inductorPart.part_uid, this.inductorPart);
        this.parts.set(this.diodePart.part_uid, this.diodePart);
        this.parts.set(this.batteryPart.part_uid, this.batteryPart);
        this.parts.set(this.ledPart.part_uid, this.ledPart);
        this.parts.set(this.andGatePart.part_uid, this.andGatePart);
        this.parts.set(this.spdtRelayPart.part_uid, this.spdtRelayPart);
        this.parts.set(this.modulePart.part_uid, this.modulePart);
        this.parts.set(this.arduinoPart.part_uid, this.arduinoPart);
        this.parts.set(this.adafruitATSAMD21Part.part_uid, this.adafruitATSAMD21Part);
        this.parts.set(this.towerProSG92RMicroServoPart.part_uid, this.towerProSG92RMicroServoPart);

        this.documents.push(this.newModuleDoc);
    }
}

export default SeedData;
