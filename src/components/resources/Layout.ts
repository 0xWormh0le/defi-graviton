const layout = {
    canvas: {
        showStats: false,
    },
    grid: {
        size: 100000,
        divisions: 6500,
    },
    terminals: {
        radius: 2,
    },
    branch_point: {
        radius_sm: 2,
        radius_md: 8,
        segments: 32,
        object_width: 2,
        object_height: 2,
    },
    modules: {
        pinLength: 5,
        pin_margin_top: 5,
        pin_margin_bottom: 5,
        pin_to_pin_margin: 10,
        min_object_width: 60,
        min_object_height: 30,
    },
    elements: {
        framePadding: 10,
        labelHeight: 20,
        labelFontSize: 10,
        maxLabelCharacters: 20,
    },
    routes: {
        route_width: 2,
    },
    z_order: {
        default: 0,
        grid: 0.1,
        element: 0.2,
        terminal: 0.4,
        route: 0.3,
        dragging_element: 0.5,
    },
    labels: {
        max_zoom_label_font_size: 30,
        font_size: 7,
        padding: 5,
        placement_configuration: {
            CENTER: "center",
            OUTSIDE_ABOVE_WITH_PADDING: "outside_above_with_padding",
        },
    },
};

export default layout;
