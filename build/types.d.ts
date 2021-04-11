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
    minScaleFactor: number;
    maxScaleFactor: number;
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
    minScaleFactor: number;
    maxScaleFactor: number;
    fitBounds: boolean;
    setMaxBounds: boolean;
}
export declare const DEFAULT_OPTIONS: IIIFLayerOptions;
export interface IIIFControlOptions extends ControlOptions {
}
