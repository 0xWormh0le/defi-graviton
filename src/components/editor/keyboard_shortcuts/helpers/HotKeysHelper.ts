import keycode from "keycode";
import {IKeyCommand} from "../../../resources/KeyCommands";
import R from "../../../resources/Namespace";
import {isMacintosh, isWindows} from "../../../utils/platform";

export class HotKeysHelper {
    public static isHotkey(hotkey: string | string[], event: KeyboardEvent) {
        if (document.activeElement?.localName === "input") {
            return false;
        }

        let result = false;
        if (Array.isArray(hotkey)) {
            hotkey.forEach((command) => {
                if (this.matchCommand(command, event)) {
                    result = true;
                }
            });
        } else {
            result = this.matchCommand(hotkey, event);
        }

        return result;
    }

    public static getKeyCommands(section: string) {
        const values = Object.values(R.keyCommands);

        return values.filter((value: IKeyCommand) => value.section === section);
    }

    public static getKeyCode(hotkey: string[]) {
        return keycode(hotkey[0]);
    }

    public static humanizeHotKey(hotkey: string | string[]) {
        const results: string[] = [];
        if (Array.isArray(hotkey)) {
            hotkey.forEach((command) => {
                const keys = command.split("+");

                if (!this.showOnThisPlatform(keys)) {
                    return;
                }

                this.convertToSymbols(keys);

                if (keys.length === 1) {
                    results.push(keys[0].toUpperCase());
                } else if (keys.length > 1) {
                    results.push(keys.map((key) => key.toUpperCase()).join(" + "));
                }
            });
        } else {
            results.push(hotkey.toUpperCase());
        }
        return results;
    }

    private static showOnThisPlatform(subCommands: string[]) {
        let result: boolean = true;
        subCommands.forEach((subCommand) => {
            if (isMacintosh() && subCommand.toLowerCase() === "ctrl") {
                result = false;
            }
            if (isWindows() && subCommand.toLowerCase() === "meta") {
                result = false;
            }
        });

        return result;
    }

    private static convertToSymbols(subCommands: string[]) {
        subCommands.forEach((subCommand, index) => {
            if (subCommand.toLowerCase() === "meta") {
                subCommands[index] = "⌘";
            }
            if (subCommand.toLowerCase() === "shift") {
                subCommands[index] = "⇧";
            }
            if (subCommand.toLowerCase() === "alt") {
                subCommands[index] = "⌥";
            }
            if (subCommand.toLowerCase() === "left") {
                subCommands[index] = "\u2190";
            }
            if (subCommand.toLowerCase() === "up") {
                subCommands[index] = "\u2191";
            }
            if (subCommand.toLowerCase() === "right") {
                subCommands[index] = "\u2192";
            }
            if (subCommand.toLowerCase() === "down") {
                subCommands[index] = "\u2193";
            }
        });
    }

    private static matchCommand(command: string, event: KeyboardEvent) {
        const keys = command.split("+").map((key) => key.toLocaleLowerCase());

        if (keys.length === 1) {
            if (event.key.toLocaleLowerCase() === keys[0]) {
                return true;
            }
            if (event.code.toLocaleLowerCase() === keys[0]) {
                return true;
            }
        } else {
            const results = [] as boolean[];
            keys.forEach((key) => {
                if (key === "ctrl" && event.ctrlKey) {
                    results.push(true);
                }
                if (key === "meta" && event.metaKey) {
                    results.push(true);
                }
                if (key === "shift" && event.shiftKey) {
                    results.push(true);
                }
                if (key === event.key) {
                    results.push(true);
                }
                if (key === event.code) {
                    results.push(true);
                }
            });
            if (results.filter((result) => result).length === keys.length) {
                return true;
            }
        }
        return false;
    }
}
