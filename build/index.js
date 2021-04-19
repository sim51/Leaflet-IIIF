"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IIIFControl = exports.IIIFLayer = void 0;
const event_1 = require("./event");
const layer_1 = require("./layer");
Object.defineProperty(exports, "IIIFLayer", { enumerable: true, get: function () { return layer_1.IIIFLayer; } });
const toolbar_1 = require("./toolbar");
Object.defineProperty(exports, "IIIFControl", { enumerable: true, get: function () { return toolbar_1.IIIFControl; } });
require("./assets/index.scss");
window.L["Iiif"] = { Event: event_1.IIIF_EVENTS };
window.L.tileLayer["iiif"] = function (url, options) {
    return new layer_1.IIIFLayer(url, options);
};
window.L.control["iiif"] = function (layer, options) {
    return new toolbar_1.IIIFControl(layer, options);
};
//# sourceMappingURL=index.js.map