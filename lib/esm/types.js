"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONTROL_OPTIONS = exports.DEFAULT_OPTIONS = exports.SERVER_CAPABILITIES_DEFAULT = void 0;
const tslib_1 = require("tslib");
const leaflet_1 = tslib_1.__importDefault(require("leaflet"));
exports.SERVER_CAPABILITIES_DEFAULT = {
    version: "3.0",
    formats: [],
    qualities: [],
    rotation: false,
    mirroring: false,
    tileSize: null,
    minZoom: 0,
    maxZoom: 0,
};
exports.DEFAULT_OPTIONS = {
    tileSize: leaflet_1.default.point(256, 256),
    tileFormat: "jpg",
    quality: "default",
    rotation: 0,
    mirroring: false,
    fitBounds: true,
    setMaxBounds: false,
    minZoom: 0,
    maxZoom: 0,
    zoomOffset: 0,
};
exports.DEFAULT_CONTROL_OPTIONS = {
    quality: {
        enabled: true,
        title: "Quality",
        html: `<span />`,
    },
    format: {
        enabled: true,
        title: "Format",
        html: `<span />`,
    },
    rotation: {
        enabled: true,
        title: "Rotation",
        html: `<span />`,
    },
    mirroring: {
        enabled: true,
        title: "Mirroring",
        html: `<span />`,
    },
};
//# sourceMappingURL=types.js.map