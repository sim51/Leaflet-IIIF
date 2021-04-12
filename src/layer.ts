import L, { Map, Point, TileLayer, TileLayerOptions, TileEvent, Util } from "leaflet";
import { DEFAULT_OPTIONS, SERVER_CAPABILITIES_DEFAULT, IIIFLayerOptions, ServerCapabilities } from "./types";
import { computeServerCapabilities, templateUrl } from "./utils";

export class IIIFLayer extends TileLayer {
  // Layer options
  public options: IIIFLayerOptions;

  // Leaflet map
  map: Map | null = null;
  _url: string;

  // Promise of the
  initializePromise: Promise<void>;

  // Server capabilities
  server: ServerCapabilities = SERVER_CAPABILITIES_DEFAULT;

  // Dimension of the image
  height: number = 0;
  width: number = 0;

  zoomLayers: Array<{
    // Map zoom level
    zoom: number;
    // the scaling ratio
    scale: number;
    // height of the image at this scale
    height: number;
    // width of the image at this scale
    width: number;
    // number of tiles in x & y
    tiles: [number, number];
  }> = [];

  /**
   * IIIF Layer constructor.
   *
   * @param {string} url The IIIF info endpoint for an image  (ex: https://stacks.stanford.edu/image/iiif/hg676jb4964%2F0380_796-44/info.json)
   * @param {object} options List of options for the layer
   */
  constructor(url: string, options: Partial<IIIFLayerOptions> = {}) {
    super(url, options);
    this.setUrl(templateUrl(url));
  }

  /**
   * Initialize the layer by calling the info endpoint of the image,
   * compute the server capabilities and set the initial state.
   */
  initialize(url: string, options: Partial<IIIFLayerOptions>): this {
    this.initializePromise = new Promise(async (resolve, reject) => {
      try {
        // Calling the iiif info endpoint
        const response = await fetch(url);
        const data: any = await response.json();

        // saving the image dimension
        this.height = data.height;
        this.width = data.width;

        // server capabilities
        this.server = computeServerCapabilities(data);

        // Settings
        this.options = Object.assign(
          this.options,
          DEFAULT_OPTIONS,
          // Server pref
          {
            tileSize: this.server.tileSize,
            tileFormat: this.server.formats[0],
            quality: this.server.qualities.includes("native") ? "native" : "default",
            minZoom: this.server.minZoom,
            maxZoom: this.server.maxZoom,
          },
          // User's options
          options,
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    return this;
  }

  onAdd(map: Map): this {
    this.map = map;

    // Wait for info.json fetch and parse to complete
    this.initializePromise.then(() => {
      // Compute image sizes
      this.computeZoomLayers();

      // calling super after we compute all the zoom
      super.onAdd(map);

      // Fit bounds
      if (this.options.fitBounds) {
        this.map.fitBounds(this.getBounds());
      }

      // Set max bound
      if (this.options.setMaxBounds) {
        this.map.setMaxBounds(this.getBounds());
      }
    });

    // Reset tile sizes to handle non 256x256 IIIF tiles
    this.on("tileload", (tile: TileEvent): void => {
      tile.tile.style.width = `${tile.tile.naturalWidth}px`;
      tile.tile.style.height = `${tile.tile.naturalHeight}px`;
    });

    return this;
  }

  onRemove(map: Map): this {
    // calling super
    super.onRemove(map);
    // Remove maxBounds set for this image
    if (this.options.setMaxBounds) {
      // bug in the type definition
      map.setMaxBounds((null as unknown) as L.LatLngBoundsExpression);
    }
    return this;
  }

  /**
   * Generate the tile IIIF url based on the tile coordinates
   */
  public getTileUrl(coords: L.Coords): string {
    const x = coords["x"];
    const y = coords["y"];
    const z = coords["z"];

    const zoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
    if (!zoomLayer) throw new Error(`Can't create tile for zoom ${z}`);

    const tileSizeX = this.options.tileSize.x / zoomLayer.scale;
    const tileSizeY = this.options.tileSize.y / zoomLayer.scale;

    // Compute the image region / bbox NW/SE
    let minX = Math.min(x * tileSizeX, this.width);
    let minY = Math.min(y * tileSizeY, this.height);
    let maxX = Math.min(minX + tileSizeX, this.width);
    let maxY = Math.min(minY + tileSizeY, this.height);

    // In mirroring, if we do the diff with the width,
    // we then have the bbox NE/SO,
    // so we need to switch back to NW/SE by add/subs the diff
    if (this.options.mirroring === true) {
      const diffX = maxX - minX;
      minX = this.width - minX - diffX;
      maxX = this.width - maxX + diffX;
    }

    const params = {
      format: this.options.tileFormat,
      quality: this.options.quality,
      rotation: this.options.rotation,
      mirroring: this.options.mirroring ? "!" : "",
      size: [maxX - minX, maxY - minY].map(s => Math.ceil(s * zoomLayer.scale)).join(","),
      region: [minX, minY, maxX - minX, maxY - minY].join(","),
    };
    return L.Util.template(this._url, params);
  }

  protected _isValidTile(coords: L.Coords) {
    let isValid = false;
    const x = coords["x"];
    const y = coords["y"];
    const z = coords["z"];

    if (this.options.minZoom <= z && z <= this.options.maxZoom) {
      const originalZoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
      if (0 <= x && x < originalZoomLayer.tiles[0] && 0 <= y && y < originalZoomLayer.tiles[1]) isValid = true;
    }
    return isValid;
  }

  /**
   * Compute the bounds of the layer.
   */
  private getBounds(): L.LatLngBounds {
    let result = L.latLngBounds([0, 1], [1, 0]);

    const originalZoomLayer = this.zoomLayers.find(layer => layer.scale === 1);
    if (this.map !== null && originalZoomLayer) {
      const sw = this.map.unproject(L.point(0, originalZoomLayer.height), 0);
      const ne = this.map.unproject(L.point(originalZoomLayer.width, 0), 0);
      result = L.latLngBounds(sw, ne);
    }

    return result;
  }

  /**
   * Compute the different images by zoom level
   */
  private computeZoomLayers(): void {
    this.zoomLayers = [];

    let zoom = this.options.minZoom;
    while (zoom <= this.options.maxZoom) {
      const scale = Math.pow(2, zoom);
      const height = Math.ceil(this.height * scale);
      const width = Math.ceil(this.width * scale);
      this.zoomLayers.push({
        zoom,
        scale,
        height,
        width,
        tiles: [Math.ceil(width / this.options.tileSize.x), Math.ceil(height / this.options.tileSize.y)],
      });
      zoom++;
    }
    // Setting the min /max zoom in the options & map
    this.map.setMaxZoom(this.zoomLayers[this.zoomLayers.length - 1].zoom);
    this.map.setMinZoom(this.zoomLayers[0].zoom);
  }
}
