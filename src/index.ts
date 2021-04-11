import L from "leaflet";
import { IIIFLayerOptions, IIIFControlOptions, ServerCapabilities } from "./types";
import { IIIFLayer } from "./layer";
import { IIIFControl } from "./toolbar";
import "./style.css";

export { IIIFLayer, IIIFControl, IIIFLayerOptions, IIIFControlOptions, ServerCapabilities };

window.L.tileLayer["iiif"] = function(url: string, options: IIIFLayerOptions) {
  return new IIIFLayer(url, options);
};

window.L.control["iiif"] = function(layer: IIIFLayer, options: IIIFControlOptions) {
  return new IIIFControl(layer, options);
};
