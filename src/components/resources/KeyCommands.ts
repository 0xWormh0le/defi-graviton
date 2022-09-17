export interface IKeyCommand {
    section?: string;
    description: string;
    key_name?: string;
    keys: string[] | string;
}

const keyCommands = {
    open_hotkey_viewer: {
        section: "General",
        description: "Open Keyboard shortcut viewer",
        keys: ["ctrl+h", "meta+h"],
    } as IKeyCommand,
    navigate_left: {
        section: "Navigation",
        description: "Navigate left",
        keys: ["left"],
    },
    navigate_up: {
        section: "Navigation",
        description: "Navigate up",
        keys: ["up"],
    },
    navigate_right: {
        section: "Navigation",
        description: "Navigate right",
        keys: ["right"],
    },
    navigate_down: {
        section: "Navigation",
        description: "Navigate down",
        keys: ["down"],
    },
    zoom_in: {
        section: "Navigation",
        description: "Zoom in",
        key_name: "+",
        keys: ["Equal"],
    },
    zoom_out: {
        section: "Navigation",
        description: "Zoom out",
        key_name: "-",
        keys: ["Minus"],
    },
    zoomToFit: {
        section: "Navigation",
        description: "Zoom to fit entire circuit or selected subjects",
        key_name: "\\",
        keys: ["Backslash"],
    },
    select_all: {
        section: "Selection",
        description: "Select all subjects on canvas",
        keys: ["ctrl+a", "meta+a"],
    },
    unselect_all: {
        section: "Selection",
        description: "Unselect selected subjects",
        keys: ["ctrl+shift+a", "meta+shift+a"],
    },
    escape_routing: {
        section: "Selection",
        description: "Escape routing",
        keys: ["Escape"],
    },
    delete: {
        section: "Subject Actions",
        description: "Zoom to fit entire circuit or selected subjects",
        keys: ["Backspace"],
    },
    copy: {
        section: "Subject Actions",
        description: "Copy selected subjects",
        keys: ["ctrl+c", "meta+c"],
    },
    cut: {
        section: "Subject Actions",
        description: "Cut selected subjects",
        keys: ["ctrl+x", "meta+x"],
    },
    paste: {
        section: "Subject Actions",
        description: "Paste subjects",
        keys: ["ctrl+v", "meta+v"],
    },
    rotate_clockwise: {
        section: "Subject Actions",
        description: "Rotate selected subjects clockwise",
        keys: ["ctrl+]", "meta+]"],
    },
    rotate_counter_clockwise: {
        section: "Subject Actions",
        description: "Rotate selected subjects counter clockwise",
        keys: ["ctrl+[", "meta+["],
    },
    flip: {
        section: "Subject Actions",
        description: "Flip selected subjects horizontally",
        keys: ["ctrl+'", "meta+'"],
    },
    convert_to_part: {
        section: "Subject Actions",
        description: "Convert selected subjects into new part",
        keys: ["ctrl+p", "meta+p"],
    },
    edit_part: {
        section: "Subject Actions",
        description: "Edit selected element part",
        keys: ["ctrl+e", "meta+e"],
    },
    search: {
        section: "Part Browser",
        description: "Find Part",
        keys: ["ctrl+f", "meta+f"],
    },
};

export default keyCommands;
