import { ControlOptions, Point, TileLayerOptions } from "leaflet";
/**
 * List the capabilities of the server.
 */
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
/**
 * Settings of the layer.
 */
export interface IIIFLayerOptions extends TileLayerOptions {
    tileSize: Point;
    tileFormat: string;
    quality: string;
    rotation: number;
    mirroring: boolean;
    fitBounds: boolean;
    setMaxBounds: boolean;
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
    mirroring: IIIFControlAction;
}
export declare const DEFAULT_CONTROL_OPTIONS: IIIFControlOptions;
export {};
