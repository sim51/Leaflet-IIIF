import { IIIF_EVENTS } from "./event";
import { IIIFLayer } from "./layer";
import { IIIFControl } from "./toolbar";
export { IIIFLayer, IIIFControl };
window.L["Iiif"] = { Event: IIIF_EVENTS };
window.L.tileLayer["iiif"] = function (url, options) {
    return new IIIFLayer(url, options);
};
window.L.control["iiif"] = function (layer, options) {
    return new IIIFControl(layer, options);
};
//# sourceMappingURL=index.js.map