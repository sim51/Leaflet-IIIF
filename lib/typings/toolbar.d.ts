import { Control, Map } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIFControlOptions } from "./types";
export declare class IIIFControl extends Control {
    options: IIIFControlOptions;
    layer: IIIFLayer;
    _container: HTMLElement;
    /**
     * IIIF Control constructor.
     *
     * @param {object} options List of options for the control
     */
    constructor(layer: IIIFLayer, options?: Partial<IIIFControlOptions>);
    onAdd(map: Map): HTMLElement;
    /**
     * Create a button
     */
    private createActions;
    /**
     * Create a button
     */
    private createButton;
}
