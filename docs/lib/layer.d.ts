import L, { Map, TileLayer } from "leaflet";
import { IIIFLayerOptions, ServerCapabilities } from "./types";
export declare class IIIFLayer extends TileLayer {
    options: IIIFLayerOptions;
    map: Map | null;
    _url: string;
    initializePromise: Promise<void>;
    server: ServerCapabilities;
    height: number;
    width: number;
    zoomLayers: Array<{
        zoom: number;
        scale: number;
        height: number;
        width: number;
        tiles: [number, number];
    }>;
    constructor(url: string, options?: Partial<IIIFLayerOptions>);
    initialize(url: string, options: Partial<IIIFLayerOptions>): this;
    onAdd(map: Map): this;
    onRemove(map: Map): this;
    getTileUrl(coords: L.Coords): string;
    protected _isValidTile(coords: L.Coords): boolean;
    private getBounds;
    private computeZoomLayers;
    private registerEvents;
    private unRegisterEvents;
    private changeFormat;
    private changeQuality;
    private changeRotation;
    private changeMirroring;
    private onTileLoadStyle;
}
