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
    /**
     * IIIF Layer constructor.
     *
     * @param {string} url The IIIF info endpoint for an image  (ex: https://stacks.stanford.edu/image/iiif/hg676jb4964%2F0380_796-44/info.json)
     * @param {object} options List of options for the layer
     */
    constructor(url: string, options?: Partial<IIIFLayerOptions>);
    /**
     * Initialize the layer by calling the info endpoint of the image,
     * compute the server capabilities and set the initial state.
     */
    initialize(url: string, options: Partial<IIIFLayerOptions>): this;
    onAdd(map: Map): this;
    onRemove(map: Map): this;
    /**
     * Generate the tile IIIF url based on the tile coordinates
     */
    getTileUrl(coords: L.Coords): string;
    protected _isValidTile(coords: L.Coords): boolean;
    /**
     * Compute the bounds of the layer.
     */
    private getBounds;
    /**
     * Compute the different images by zoom level
     */
    private computeZoomLayers;
}
