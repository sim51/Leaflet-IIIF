import { ControlOptions, Point, TileLayerOptions } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIFControl } from "./toolbar";
export interface ServerCapabilities {
    version: string;
    formats: Array<string>;
    qualities: Array<string>;
    rotation: boolean;
    mirroring: boolean;
    minZoom: number;
    maxZoom: number;
    tileSize: Point | null;
}
export declare const SERVER_CAPABILITIES_DEFAULT: ServerCapabilities;
export interface IIIFLayerOptions extends TileLayerOptions {
    tileSize: Point;
    tileFormat: string;
    quality: string;
    rotation: number;
    mirroring: boolean;
    fitBounds: boolean;
    setMaxBounds: boolean;
    minZoom: number;
    maxZoom: number;
}
export declare const DEFAULT_OPTIONS: IIIFLayerOptions;
interface IIIFControlAction {
    enabled: boolean;
    title: string;
    html: string;
    values?: Array<string>;
}
export interface IIIFControlOptions extends ControlOptions {
    quality: IIIFControlAction;
    format: IIIFControlAction;
    rotation: IIIFControlAction;
    mirroring: IIIFControlAction;
}
export declare const DEFAULT_CONTROL_OPTIONS: IIIFControlOptions;
declare global {
    interface LeafletIIFWindow {
        Iiif: {
            Event: unknown;
        };
        tileLayer: {
            iiif: (url: string, options: IIIFLayerOptions) => IIIFLayer;
        };
        control: {
            iiif: (layer: IIIFLayer, options: IIIFControlOptions) => IIIFControl;
        };
    }
    interface Window {
        L: LeafletIIFWindow;
    }
}
export {};
