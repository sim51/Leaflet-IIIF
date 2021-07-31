import L, { ControlOptions, Point, TileLayerOptions } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIFControl } from "./toolbar";

/**
 * List the capabilities of the server.
 */
export interface ServerCapabilities {
  /**
   * IIIF version of the server (1.1, 2.0 or 3.0)
   */
  version: string;
  /**
   * List of supported formats
   */
  formats: Array<string>;
  /**
   * List of supported qualities
   */
  qualities: Array<string>;
  /**
   * Support 90s rotation ?
   * @default false
   */
  rotation: boolean;
  /**
   * Support mirroring ?
   * @default false
   */
  mirroring: boolean;
  /**
   * Min zoom (related to Scale factors)
   * @default 0
   */
  minZoom: number;
  /**
   * max zoom (related to Scale factors)
   * @default 0
   */
  maxZoom: number;
  /**
   * Prefered tile size
   */
  tileSize: Point | null;
}

/**
 * Default values for server capabilties
 */
export const SERVER_CAPABILITIES_DEFAULT: ServerCapabilities = {
  version: "3.0",
  formats: [],
  qualities: [],
  rotation: false,
  mirroring: false,
  tileSize: null,
  minZoom: 0,
  maxZoom: 0,
};

/**
 * Settings for {@link IIIFLayer | IIIF layer}
 */
export interface IIIFLayerOptions extends TileLayerOptions {
  /**
   * Size of the tile (as a square)
   * If not specified and the server has a preference, we take it, otherwise 256
   * @default 256
   */
  tileSize: Point;
  /**
   * Format of the tiles (ie png, jpg, ...).
   * @Default "jpg"
   */
  tileFormat: string;
  /**
   * Quality
   * @default: "default"
   */
  quality: string;
  /**
   * Rotation (ex: 0, 90, 180, 270).
   * @default 0
   */
  rotation: number;
  /**
   * Mirroring
   * @default false
   */
  mirroring: boolean;
  /**
   * When initialiazed the layer, do you want to see the full picture ?
   * @default true
   */
  fitBounds: boolean;
  /**
   * Does the user can pan outside the image ?
   * @default false
   */
  setMaxBounds: boolean;
  /**
   * Min level zoom of the layer.
   * @default 0
   */
  minZoom: number;
  /**
   * Max level zoom of the layer.
   * @default 0
   */
  maxZoom: number;
}

/**
 * Default values for {@link IIIFLayerOptions}
 */
export const DEFAULT_OPTIONS: IIIFLayerOptions = {
  tileSize: L.point(256, 256),
  tileFormat: "jpg",
  quality: "default",
  rotation: 0,
  mirroring: false,
  fitBounds: true,
  setMaxBounds: false,
  minZoom: 0,
  maxZoom: 0,
  zoomOffset: 0,
};

/**
 * Configuration of an action on the control bar.
 * An action is an entry on the toolbal like, quality, format, ...
 */
interface IIIFControlAction {
  /**
   * Does the action is enabled ?
   */
  enabled: boolean;
  /**
   * Title of the action (used for title attribute in html)
   */
  title: string;
  /**
   * The html code to display the action entry in the toolbar.
   */
  html: string;
  /**
   * An optional list of possible values for this action.
   * It's usefull for qualities, formats, ...
   */
  values?: Array<string>;
}

/**
 * Settings of {@link IIIFControl | IIIF control layer}
 */
export interface IIIFControlOptions extends ControlOptions {
  quality: IIIFControlAction;
  format: IIIFControlAction;
  rotation: IIIFControlAction;
  mirroring: IIIFControlAction;
}

/**
 * Default values for {@link IIIFControlOptions}
 */
export const DEFAULT_CONTROL_OPTIONS: IIIFControlOptions = {
  quality: {
    enabled: true,
    title: "Quality",
    html: `<span />`,
  },
  format: {
    enabled: true,
    title: "Format",
    html: `<span />`,
  },
  rotation: {
    enabled: true,
    title: "Rotation",
    html: `<span />`,
  },
  mirroring: {
    enabled: true,
    title: "Mirroring",
    html: `<span />`,
  },
};

declare global {
  interface LeafletIIFWindow {
    Iiif: { Event: unknown };
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
