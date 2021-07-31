import { Control, Map } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIFControlOptions } from "./types";
export declare class IIIFControl extends Control {
    options: IIIFControlOptions;
    layer: IIIFLayer;
    private _container;
    constructor(layer: IIIFLayer, options?: Partial<IIIFControlOptions>);
    onAdd(map: Map): HTMLElement;
    private createActions;
    private createButton;
}
