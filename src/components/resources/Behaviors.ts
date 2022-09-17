const behaviors = {
    camera: {
        frustrum: {
            near: -10000,
            far: 10000,
        },
    },
    navigation_controls: {
        keySpanSpeed: 15,
        dampingFactor: 0.09,
    },
    zoom_controls: {
        minZoom: 0.01,
        maxZoom: 8,
        minZoomBleed: 0.1,
        default_zoom: 2.5,
        navigation_threshold: 0.030000000000000672,
        manual_zoom_step: 0.3,
        zoomToFitPadding: 0.4,
        scrollWheelZoomFactor: 100,
        pinchZoomFactor: 75,
        writeDelay: 1000,
        writeMaxWait: 3000,
    },
    select_controls: {
        raycaster_line_precision: 5,
    },
    subjects: {
        labels: {},
    },
    action_panel: {
        duplicate: {
            spacing: 150,
        },
    },
    storage: {
        writeDelay: 1000,
        writeMaxWait: 3000,
    },
};

export default behaviors;
