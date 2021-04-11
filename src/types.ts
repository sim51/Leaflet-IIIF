import L, { ControlOptions, Point, TileLayerOptions } from "leaflet";
/**
 * List the capabilities of the server.
 */
export interface ServerCapabilities {
  // IIIF version of the server (1.1, 2.0 or 3.0)
  version: string;
  // List of supported formats
  formats: Array<string>;
  // List of supported qualities
  qualities: Array<string>;
  // Support 90s ratotation ?
  rotation: boolean;
  // Support mirroring ?
  mirroring: boolean;
  // Scale factors
  minScaleFactor: number;
  maxScaleFactor: number;
  // Preferd tile size
  tileSize: Point | null;
}

export const SERVER_CAPABILITIES_DEFAULT: ServerCapabilities = {
  version: "3.0",
  formats: [],
  qualities: [],
  rotation: false,
  mirroring: false,
  tileSize: null,
  minScaleFactor: 1,
  maxScaleFactor: 1,
};

/**
 * Settings of the layer.
 */
export interface IIIFLayerOptions extends TileLayerOptions {
  // Size of the tile (as a square)
  // If not specified and the server has a preference, we take it, otherwise 256
  tileSize: Point;
  // Format of the tiles (ie png, jpg, ...).
  // Default is 'jpg'
  tileFormat: string;
  // Quality
  quality: string;
  // Rotation (ex: 0, 90, 180, 270).
  // Default: 0
  rotation: number;
  // Mirroring
  // Default false
  mirroring: boolean;
  // Min & max scale factors (ex: { min: 0.25, max: 16 })
  minScaleFactor: number;
  maxScaleFactor: number;
  // When initialiazed the layer, do you want to see the full picture ?
  fitBounds: boolean;
  // Does the user can pan outside the image ?
  setMaxBounds: boolean;
}

export const DEFAULT_OPTIONS: IIIFLayerOptions = {
  tileSize: L.point(256, 256),
  tileFormat: "jpg",
  quality: "default",
  rotation: 0,
  mirroring: false,
  minScaleFactor: 1,
  maxScaleFactor: 1,
  fitBounds: true,
  setMaxBounds: false,
  minZoom: 0,
  maxZoom: 10,
  zoomOffset: 0,
};

export interface IIIFControlOptions extends ControlOptions {}
