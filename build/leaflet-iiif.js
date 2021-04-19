(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("leaflet"));
	else if(typeof define === 'function' && define.amd)
		define(["leaflet"], factory);
	else if(typeof exports === 'object')
		exports["leaflet-iiif"] = factory(require("leaflet"));
	else
		root["leaflet-iiif"] = factory(root["L"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE__3__) {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIF_EVENTS = void 0;
exports.IIIF_EVENTS = {
    CHANGE_FORMAT: "iiif:format",
    CHANGE_QUALITY: "iiif:quality",
    CHANGE_ROTATION: "iiif:rotation",
    CHANGE_MIRRORING: "iiif:mirroring",
};


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFLayer = void 0;
const leaflet_1 = __importStar(__webpack_require__(3));
const types_1 = __webpack_require__(4);
const event_1 = __webpack_require__(1);
const server_capabilities_1 = __webpack_require__(5);
const helper_1 = __webpack_require__(6);
const projection_1 = __webpack_require__(7);
class IIIFLayer extends leaflet_1.TileLayer {
    /**
     * IIIF Layer constructor.
     *
     * @param {string} url The IIIF info endpoint for an image  (ex: https://stacks.stanford.edu/image/iiif/hg676jb4964%2F0380_796-44/info.json)
     * @param {object} options List of options for the layer
     */
    constructor(url, options = {}) {
        super(url, options);
        // Leaflet map
        this.map = null;
        // Server capabilities
        this.server = types_1.SERVER_CAPABILITIES_DEFAULT;
        // Dimension of the image
        this.height = 0;
        this.width = 0;
        this.zoomLayers = [];
        this.setUrl(helper_1.templateUrl(url));
    }
    /**
     * Initialize the layer by calling the info endpoint of the image,
     * compute the server capabilities and set the initial state.
     */
    initialize(url, options) {
        this.initializePromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Calling the iiif info endpoint
                const response = yield fetch(url);
                const data = yield response.json();
                // saving the image dimension
                this.height = data.height;
                this.width = data.width;
                // server capabilities
                this.server = server_capabilities_1.computeServerCapabilities(data);
                // Settings
                this.options = Object.assign(this.options, types_1.DEFAULT_OPTIONS, 
                // Server pref
                {
                    tileSize: this.server.tileSize,
                    tileFormat: this.server.formats[0],
                    quality: this.server.qualities.includes("native") ? "native" : "default",
                    minZoom: this.server.minZoom,
                    maxZoom: this.server.maxZoom,
                }, 
                // User's options
                options);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }));
        return this;
    }
    onAdd(map) {
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
        // register events
        this.registerEvents(map);
        return this;
    }
    onRemove(map) {
        // calling super
        super.onRemove(map);
        // Remove maxBounds set for this image
        if (this.options.setMaxBounds) {
            // bug in the type definition
            map.setMaxBounds(null);
        }
        // unregister events
        this.unRegisterEvents(map);
        return this;
    }
    /**
     * Generate the tile IIIF url based on the tile coordinates
     */
    getTileUrl(coords) {
        const z = coords["z"];
        const x = coords["x"];
        const y = coords["y"];
        const zoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
        if (!zoomLayer)
            throw new Error(`Can't create tile for zoom ${z}`);
        // Handle rotation
        const unprojectedSquare = projection_1.projectSquare(-1 * this.options.rotation, {
            bottomLeft: { x, y },
            topRight: { x: x + 1, y: y + 1 },
        });
        const tileSizeX = this.options.tileSize.x / zoomLayer.scale;
        const tileSizeY = this.options.tileSize.y / zoomLayer.scale;
        // Compute the image region / bbox NW/SE
        let minX = Math.min(unprojectedSquare.bottomLeft.x * tileSizeX, this.width);
        let minY = Math.min(unprojectedSquare.bottomLeft.y * tileSizeY, this.height);
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
            mirroring: this.options.mirroring,
            region: [minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY)],
            rotation: 360 - this.options.rotation,
            size: [Math.abs(maxX - minX), Math.abs(maxY - minY)].map(s => Math.ceil(s * zoomLayer.scale)),
        };
        return leaflet_1.default.Util.template(this._url, {
            format: params.format,
            quality: params.quality,
            mirroring: params.mirroring ? "!" : "",
            region: params.region.join(","),
            rotation: params.rotation,
            size: params.size.join(","),
        });
    }
    _isValidTile(coords) {
        let isValid = false;
        const x = coords["x"];
        const y = coords["y"];
        const z = coords["z"];
        // Handle rotation (leaflet axis are reversed, so a 90 rotation is in fact a -90 rotation)
        const unprojectedSquare = projection_1.projectSquare(-1 * this.options.rotation, {
            bottomLeft: { x, y },
            topRight: { x: x + 1, y: y + 1 },
        });
        if (this.options.minZoom <= z && z <= this.options.maxZoom) {
            const originalZoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
            if (0 <= unprojectedSquare.bottomLeft.x &&
                unprojectedSquare.bottomLeft.x < originalZoomLayer.tiles[0] &&
                0 <= unprojectedSquare.bottomLeft.y &&
                unprojectedSquare.bottomLeft.y < originalZoomLayer.tiles[1])
                isValid = true;
        }
        return isValid;
    }
    /**
     * Compute the bounds of the layer.
     */
    getBounds() {
        let result = leaflet_1.default.latLngBounds([0, 1], [1, 0]);
        const originalZoomLayer = this.zoomLayers.find(layer => layer.scale === 1);
        if (this.map !== null && originalZoomLayer) {
            const projectedSquare = projection_1.projectSquare(this.options.rotation, {
                bottomLeft: { x: 0, y: originalZoomLayer.height },
                topRight: { x: originalZoomLayer.width, y: 0 },
            });
            const sw = this.map.unproject(leaflet_1.default.point(projectedSquare.bottomLeft), 0);
            const ne = this.map.unproject(leaflet_1.default.point(projectedSquare.topRight), 0);
            result = leaflet_1.default.latLngBounds(sw, ne);
        }
        return result;
    }
    /**
     * Compute the different images by zoom level
     */
    computeZoomLayers() {
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
    registerEvents(map) {
        this.on("tileload", this.onTileLoadStyle);
        map.on(event_1.IIIF_EVENTS.CHANGE_FORMAT, (e) => this.changeFormat(e.value));
        map.on(event_1.IIIF_EVENTS.CHANGE_QUALITY, (e) => this.changeQuality(e.value));
        map.on(event_1.IIIF_EVENTS.CHANGE_ROTATION, (e) => this.changeRotation(e.value));
        map.on(event_1.IIIF_EVENTS.CHANGE_MIRRORING, (e) => this.changeMirroring(e.value));
    }
    unRegisterEvents(map) {
        this.off("tileload", this.onTileLoadStyle);
        map.off(event_1.IIIF_EVENTS.CHANGE_FORMAT, (e) => this.changeFormat(e.value));
        map.off(event_1.IIIF_EVENTS.CHANGE_QUALITY, (e) => this.changeQuality(e.value));
        map.off(event_1.IIIF_EVENTS.CHANGE_ROTATION, (e) => this.changeRotation(e.value));
        map.off(event_1.IIIF_EVENTS.CHANGE_MIRRORING, (e) => this.changeMirroring(e.value));
    }
    changeFormat(value) {
        this.options.tileFormat = value;
        this.redraw();
    }
    changeQuality(value) {
        this.options.quality = value;
        this.redraw();
    }
    changeRotation(value) {
        this.options.rotation = value;
        // Set max bound
        if (this.options.setMaxBounds) {
            this.map.setMaxBounds(this.getBounds());
        }
        this.redraw();
    }
    changeMirroring(value) {
        this.options.mirroring = value;
        this.redraw();
    }
    /**
     * Handle border of images when the tiles are not full.
     */
    onTileLoadStyle(tile) {
        if (tile.tile.naturalWidth !== this.options.tileSize.x || tile.tile.naturalHeight !== this.options.tileSize.y) {
            tile.tile.style.width = `${tile.tile.naturalWidth}px`;
            tile.tile.style.height = `${tile.tile.naturalHeight}px`;
            const rotation = this.options.rotation % 360;
            switch (rotation) {
                case 90:
                    tile.tile.style.top = `${this.options.tileSize.x - tile.tile.naturalHeight}px`;
                    tile.tile.style.right = `${this.options.tileSize.y - tile.tile.naturalWidth}px`;
                    break;
                case 180:
                    tile.tile.style.top = `${this.options.tileSize.x - tile.tile.naturalHeight}px`;
                    tile.tile.style.left = `${this.options.tileSize.y - tile.tile.naturalWidth}px`;
                    break;
                case 270:
                    tile.tile.style.top = "0";
                    tile.tile.style.bottom = `${this.options.tileSize.x - tile.tile.naturalHeight}px`;
                    tile.tile.style.left = `${this.options.tileSize.y - tile.tile.naturalWidth}px`;
                    break;
            }
        }
    }
}
exports.IIIFLayer = IIIFLayer;


/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_CONTROL_OPTIONS = exports.DEFAULT_OPTIONS = exports.SERVER_CAPABILITIES_DEFAULT = void 0;
const leaflet_1 = __importDefault(__webpack_require__(3));
exports.SERVER_CAPABILITIES_DEFAULT = {
    version: "3.0",
    formats: [],
    qualities: [],
    rotation: false,
    mirroring: false,
    tileSize: null,
    minZoom: 0,
    maxZoom: 0,
};
exports.DEFAULT_OPTIONS = {
    tileSize: leaflet_1.default.point(256, 256),
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
exports.DEFAULT_CONTROL_OPTIONS = {
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


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeServerCapabilitiesForV1 = exports.computeServerCapabilities = void 0;
const leaflet_1 = __importDefault(__webpack_require__(3));
const types_1 = __webpack_require__(4);
/**
 * Compute the server capabilities from the response of the info.
 */
function computeServerCapabilities(data) {
    let uri = `${data["@context"]}`;
    // in v3 it can be an array where the last item is the uri
    if (data["@context"] instanceof Array) {
        uri = data["@context"][data["@context"].length - 1];
    }
    switch (uri) {
        case "http://library.stanford.edu/iiif/image-api/1.1/context.json":
            return computeServerCapabilitiesForV1(data);
            break;
        case "http://iiif.io/api/image/2/context.json":
            return computeServerCapabilitiesForV2(data);
            break;
        case "http://iiif.io/api/image/3/context.json":
        default:
            return computeServerCapabilitiesForV3(data);
            break;
    }
}
exports.computeServerCapabilities = computeServerCapabilities;
/**
 * Compute the server capabilities for a IIIF server in v1.1.
 * @see https://iiif.io/api/image/1.1/compliance/
 */
function computeServerCapabilitiesForV1(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "1.1";
    // Search the level compliance level
    const match = `${data.profile}`.match(/^http:\/\/library.stanford.edu\/iiif\/image-api\/1.1\/compliance.html#(.*)$/);
    const level = match && match.length === 2 ? match[1] : "level0";
    // Defined capabilities per level
    switch (level) {
        case "level2":
            capabilities.rotation = true;
            capabilities.formats = ["jpg", "png"];
            capabilities.qualities = ["native", "color", "grey", "bitonial"];
            break;
        case "level1":
            capabilities.rotation = true;
            capabilities.formats = ["jpg"];
            capabilities.qualities = ["native"];
            break;
        // level0
        default:
            capabilities.rotation = false;
            capabilities.formats = ["jpg"];
            capabilities.qualities = ["native"];
            break;
    }
    // Formats
    if (data.formats)
        capabilities.formats = data.formats;
    // Qualities
    if (data.qualities)
        capabilities.qualities = data.qualities;
    // Tiles size
    if (data.tile_width)
        capabilities.tileSize = leaflet_1.default.point(data.tile_width, data.tile_height ? data.tile_height : data.tile_width);
    // Scale factors
    if (data.scale_factors && data.scale_factors.length > -1) {
        capabilities.minZoom =
            Math.log2(data.scale_factors[data.scale_factors.length - 1]) *
                (data.scale_factors[data.scale_factors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(data.scale_factors[0]) * (data.scale_factors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}
exports.computeServerCapabilitiesForV1 = computeServerCapabilitiesForV1;
/**
 * Compute the server capabilities for a IIIF server in v2.0.
 * @see https://iiif.io/api/image/2.0/#successful-responses
 */
function computeServerCapabilitiesForV2(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "2.0";
    const level = data.profile[0];
    // Defined capabilities per level
    switch (level) {
        case "level2":
            capabilities.qualities = ["default", "bitonial"];
            capabilities.formats = ["jpg", "png"];
            break;
        case "level1":
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg", "png"];
            break;
        // level0
        default:
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg"];
            break;
    }
    // Formats
    if (data.profile[1] && data.profile[1].formats)
        capabilities.formats = data.profile[1].formats;
    // Qualities
    if (data.profile[1] && data.profile[1].qualities)
        capabilities.qualities = data.profile[1].qualities;
    // Rotation
    if (data.profile[1] &&
        data.profile[1].supports &&
        (data.profile[1].supports.includes("rotationBy90s") || data.profile[1].supports.includes("rotationArbitrary")))
        capabilities.rotation = true;
    // Mirroring
    if (data.profile[1] && data.profile[1].supports && data.profile[1].supports.includes("mirroring"))
        capabilities.mirroring = true;
    // Tiles size & scale factors
    if (data.tiles && data.tiles.length > -1) {
        const tile = data.tiles[0];
        capabilities.tileSize = leaflet_1.default.point(tile.width, tile.height ? tile.height : tile.width);
        capabilities.minZoom =
            Math.log2(tile.scaleFactors[tile.scaleFactors.length - 1]) *
                (tile.scaleFactors[tile.scaleFactors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(tile.scaleFactors[0]) * (tile.scaleFactors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}
/**
 * Compute the server capabilities for a IIIF server in v3.0.
 * @see https://iiif.io/api/image/3.0/#51-image-information-request
 */
function computeServerCapabilitiesForV3(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "3.0";
    const level = data.profile;
    // Defined capabilities per level
    switch (level) {
        case "level2":
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg", "png"];
            break;
        default:
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg"];
            break;
    }
    // Extra format
    if (data.extraFormats && data.extraFormats instanceof Array)
        capabilities.formats = capabilities.formats.concat(data.extraFormats.filter(ef => !capabilities.formats.includes(ef)));
    // Extra qualities
    if (data.extraQualities && data.extraQualities instanceof Array)
        capabilities.qualities = capabilities.qualities.concat(data.extraQualities.filter(eq => !capabilities.qualities.includes(eq)));
    // Rotation
    if (data.extraFeatures &&
        (data.extraFeatures.includes("rotationBy90s") || data.extraFeatures.includes("rotationArbitrary")))
        capabilities.rotation = true;
    // Mirroring
    if (data.extraFeatures && data.extraFeatures.includes("mirroring"))
        capabilities.mirroring = true;
    // Tiles size
    if (data.tiles && data.tiles.length > -1) {
        const tile = data.tiles[0];
        capabilities.tileSize = leaflet_1.default.point(tile.width, tile.height ? tile.height : tile.width);
        capabilities.minZoom =
            Math.log2(tile.scaleFactors[tile.scaleFactors.length - 1]) *
                (tile.scaleFactors[tile.scaleFactors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(tile.scaleFactors[0]) * (tile.scaleFactors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.templateUrl = void 0;
/**
 * Construct the tiles url template from the iiif image url
 */
function templateUrl(url) {
    return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}
exports.templateUrl = templateUrl;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.projectSquare = exports.projectPoint = void 0;
/**
 * Rotation projection of a point around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param point The point to project
 * @returns The projected point for the specified rotation.
 */
function projectPoint(rotation, point) {
    // negate to follow the direction 180-0
    const rotationInRadian = (-1 * rotation * Math.PI) / 180;
    return {
        x: Math.round(point.x * Math.cos(rotationInRadian) - point.y * Math.sin(rotationInRadian)),
        y: Math.round(point.y * Math.cos(rotationInRadian) + point.x * Math.sin(rotationInRadian)),
    };
}
exports.projectPoint = projectPoint;
/**
 * Rotation projection of a square, around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param square The square to project
 * @returns The projected square for the specified rotation.
 */
function projectSquare(rotation, square) {
    const p1 = projectPoint(rotation, square.bottomLeft);
    const p2 = projectPoint(rotation, square.topRight);
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    return {
        bottomLeft: { x: minX, y: minY },
        topRight: { x: maxX, y: maxY },
    };
}
exports.projectSquare = projectSquare;


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFControl = void 0;
const leaflet_1 = __importStar(__webpack_require__(3));
const event_1 = __webpack_require__(1);
const types_1 = __webpack_require__(4);
const CONTROL_NAME = "leaflet-control-iiif";
class IIIFControl extends leaflet_1.Control {
    /**
     * IIIF Control constructor.
     *
     * @param {object} options List of options for the control
     */
    constructor(layer, options = {}) {
        super(Object.assign({}, types_1.DEFAULT_CONTROL_OPTIONS, options));
        this.layer = layer;
        this._container = leaflet_1.default.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
    }
    onAdd(map) {
        const container = this.getContainer();
        // Waiting the init of the layer
        this.layer.initializePromise.then(() => {
            // Qualities
            if (this.options.quality.enabled === true) {
                const qualities = this.options.quality.values ? this.options.quality.values : this.layer.server.qualities;
                this.createActions(container, this.options.quality.title, `${CONTROL_NAME}-quality`, this.options.quality.html, qualities.map((quality) => {
                    return {
                        title: quality,
                        className: `${CONTROL_NAME}-quality-${quality}`,
                        innerHTML: quality,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_QUALITY, { value: quality });
                        },
                    };
                }));
            }
            // Formats
            if (this.options.format.enabled === true) {
                const formats = this.options.format.values ? this.options.format.values : this.layer.server.formats;
                this.createActions(container, this.options.format.title, `${CONTROL_NAME}-format`, this.options.format.html, formats.map((format) => {
                    return {
                        title: format,
                        className: `${CONTROL_NAME}-format-${format}`,
                        innerHTML: format,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_FORMAT, { value: format });
                        },
                    };
                }));
            }
            // Formats
            if (this.options.rotation.enabled === true && this.layer.server.rotation === true) {
                const rotations = this.options.rotation.values ? this.options.rotation.values : ["0", "90", "180", "270"];
                this.createActions(container, this.options.rotation.title, `${CONTROL_NAME}-rotation`, this.options.rotation.html, rotations.map((rotation) => {
                    return {
                        title: rotation,
                        className: `${CONTROL_NAME}-rotation-${rotation}`,
                        innerHTML: rotation,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_ROTATION, { value: Number.parseInt(rotation) });
                        },
                    };
                }));
            }
            // Mirroring
            if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
                this.createButton(container, this.options.mirroring.title, `${CONTROL_NAME}-mirroring`, this.options.mirroring.html, () => {
                    map.fire(event_1.IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
                });
            }
        });
        return container;
    }
    /**
     * Create a button
     */
    createActions(container, title, className, innerHTML, actions) {
        const actionsWrapper = leaflet_1.default.DomUtil.create("div", className);
        this.createButton(actionsWrapper, title, className, innerHTML, () => {
            if (container.dataset.opened === className)
                container.dataset.opened = "";
            else
                container.dataset.opened = className;
        });
        const actionsList = leaflet_1.default.DomUtil.create("ul", className);
        actions.forEach(action => {
            const li = leaflet_1.default.DomUtil.create("li", "", actionsList);
            this.createButton(li, action.title, action.className, action.innerHTML, () => {
                action.fn();
                container.dataset.opened = "";
            });
            actionsList.appendChild(li);
        });
        actionsWrapper.appendChild(actionsList);
        container.appendChild(actionsWrapper);
    }
    /**
     * Create a button
     */
    createButton(container, title, className, innerHTML, fn) {
        var link = leaflet_1.default.DomUtil.create("a", className, container);
        link.title = title;
        link.innerHTML = innerHTML;
        leaflet_1.default.DomEvent.on(link, "mousedown dblclick", leaflet_1.default.DomEvent.stopPropagation).on(link, "click", fn, this);
        return link;
    }
}
exports.IIIFControl = IIIFControl;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_index_scss__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 11 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _paint_board_and_brush_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(15);
/* harmony import */ var _paint_board_and_brush_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_paint_board_and_brush_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _jpg_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(16);
/* harmony import */ var _jpg_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_jpg_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _symmetry_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(17);
/* harmony import */ var _symmetry_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_symmetry_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _rotate_circular_arrow_around_a_rotated_square_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(18);
/* harmony import */ var _rotate_circular_arrow_around_a_rotated_square_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_rotate_circular_arrow_around_a_rotated_square_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_6__);
// Imports







var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()((_paint_board_and_brush_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_3___default()));
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()((_jpg_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_4___default()));
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()((_symmetry_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_5___default()));
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()((_rotate_circular_arrow_around_a_rotated_square_svg_encoding_base64__WEBPACK_IMPORTED_MODULE_6___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".leaflet-tile-container .leaflet-tile .leaflet-iiif-tile {\n  height: 100%;\n  width: 100%;\n}\n.leaflet-tile-container .leaflet-tile .leaflet-iiif-tile img {\n  flex-shrink: 0;\n}\n\n.leaflet-control-iiif a {\n  cursor: pointer;\n  background-size: 15px 15px;\n}\n.leaflet-control-iiif a.leaflet-control-iiif-quality {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n}\n.leaflet-control-iiif a.leaflet-control-iiif-format {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n}\n.leaflet-control-iiif a.leaflet-control-iiif-mirroring {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\n}\n.leaflet-control-iiif a.leaflet-control-iiif-rotation {\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ");\n}\n.leaflet-control-iiif ul {\n  display: none;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  position: relative;\n  width: 0;\n  height: 0;\n  top: -30px;\n  right: -1px;\n  flex-flow: row-reverse;\n}\n.leaflet-control-iiif ul li {\n  display: inline-block;\n}\n.leaflet-control-iiif ul li a {\n  background-color: #919187;\n  color: #fff;\n  padding: 0 5px;\n  width: auto !important;\n  border-right: 1px solid #fff;\n}\n\ndiv.leaflet-control-iiif[data-opened=leaflet-control-iiif-quality] ul.leaflet-control-iiif-quality {\n  display: flex;\n}\n\ndiv.leaflet-control-iiif[data-opened=leaflet-control-iiif-format] ul.leaflet-control-iiif-format {\n  display: flex;\n}\n\ndiv.leaflet-control-iiif[data-opened=leaflet-control-iiif-rotation] ul.leaflet-control-iiif-rotation {\n  display: flex;\n}", "",{"version":3,"sources":["webpack://./src/assets/index.scss"],"names":[],"mappings":"AAEI;EACE,YAAA;EACA,WAAA;AADN;AAGM;EACE,cAAA;AADR;;AAOE;EACE,eAAA;EACA,0BAAA;AAJJ;AAOE;EACE,yDAAA;AALJ;AAOE;EACE,yDAAA;AALJ;AAOE;EACE,yDAAA;AALJ;AAOE;EACE,yDAAA;AALJ;AAQE;EACE,aAAA;EACA,gBAAA;EACA,SAAA;EACA,UAAA;EACA,kBAAA;EACA,QAAA;EACA,SAAA;EACA,UAAA;EACA,WAAA;EACA,sBAAA;AANJ;AAQI;EACE,qBAAA;AANN;AAQM;EACE,yBAAA;EACA,WAAA;EACA,cAAA;EACA,sBAAA;EACA,4BAAA;AANR;;AAaA;EACE,aAAA;AAVF;;AAYA;EACE,aAAA;AATF;;AAWA;EACE,aAAA;AARF","sourcesContent":[".leaflet-tile-container {\n  .leaflet-tile {\n    .leaflet-iiif-tile {\n      height: 100%;\n      width: 100%;\n\n      img {\n        flex-shrink: 0;\n      }\n    }\n  }\n}\n.leaflet-control-iiif {\n  a {\n    cursor: pointer;\n    background-size: 15px 15px;\n  }\n\n  a.leaflet-control-iiif-quality {\n    background-image: url(\"./paint-board-and-brush.svg?encoding=base64\");\n  }\n  a.leaflet-control-iiif-format {\n    background-image: url(\"./jpg.svg?encoding=base64\");\n  }\n  a.leaflet-control-iiif-mirroring {\n    background-image: url(\"./symmetry.svg?encoding=base64\");\n  }\n  a.leaflet-control-iiif-rotation {\n    background-image: url(\"./rotate-circular-arrow-around-a-rotated-square.svg?encoding=base64\");\n  }\n\n  ul {\n    display: none;\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    position: relative;\n    width: 0;\n    height: 0;\n    top: -30px;\n    right: -1px;\n    flex-flow: row-reverse;\n\n    li {\n      display: inline-block;\n\n      a {\n        background-color: #919187;\n        color: #fff;\n        padding: 0 5px;\n        width: auto !important;\n        border-right: 1px solid #fff;\n      }\n    }\n  }\n}\n\n// Menu selection\ndiv.leaflet-control-iiif[data-opened=\"leaflet-control-iiif-quality\"] ul.leaflet-control-iiif-quality {\n  display: flex;\n}\ndiv.leaflet-control-iiif[data-opened=\"leaflet-control-iiif-format\"] ul.leaflet-control-iiif-format {\n  display: flex;\n}\ndiv.leaflet-control-iiif[data-opened=\"leaflet-control-iiif-rotation\"] ul.leaflet-control-iiif-rotation {\n  display: flex;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 12 */
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== "string") {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDMxLjk4NXB4IiBoZWlnaHQ9IjQzMS45ODVweCIgdmlld0JveD0iMCAwIDQzMS45ODUgNDMxLjk4NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDMxLjk4NSA0MzEuOTg1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+IDxnPiA8cGF0aCBkPSJNNDIzLjI1Nyw1MS44MjljLTAuODA4LTIuMDQ1LTIuNjctMy40ODQtNC44NTMtMy43NTFjLTIuMTc3LTAuMjY2LTQuMzM1LDAuNjgyLTUuNjEyLDIuNDcyIGMtNy41ODEsMTAuNjI5LTE3LjUyOSwxNC4xNzItMjkuMDUzLDE4LjI3NWMtOS4yOTIsMy4zMS0xOC45MDEsNi43My0yOS4yODYsMTQuMTg2Yy0xNC42ODcsMTAuNTQ0LTIxLjQwNSwyNC45MTctMTguMDU1LDM4LjU0IGwtMC4zNTgsMC40NTljLTYuMTMzLTguODk3LTEyLjgwNi0xNy4xMjYtMTkuODQ4LTI0LjQ3NGMtMzIuOTQ3LTM0LjM3OC03OC45ODQtNTUuMDQ2LTEyNi4zMTEtNTYuNzAzIGMtMi4wODUtMC4wNzMtNC4yMDQtMC4xMS02LjI5OC0wLjExYy01Mi44NDYsMC0xMDMuNDI4LDIzLjYyNC0xMzguNzc1LDY0LjgxM0M5LjY0NiwxNDYuNTEyLTUuOTM5LDE5OS44NTMsMi4wNTEsMjUxLjg4MiBjMC42NjgsNC4zNDksMS41MDQsOC43NDMsMi40ODcsMTMuMDYzYzEyLjk5Niw1Ny4yMDIsNDYuMTg5LDEwMC43MTcsOTEuMDY5LDExOS4zODNjMTEuMDYzLDQuNjAyLDIyLjIyMiw2LjkzNCwzMy4xNjMsNi45MzQgYzI3LjE4MywwLDUwLjkyNi0xNC41MzksNjUuMTQzLTM5Ljg4OWM1LjQwNC05LjY0Niw4Ljg5MS0xOS42MjEsMTAuMzYtMjkuNjUxYzAuODY2LTUuOTIsMC4yNzQtMTEuODM1LTAuMy0xNy41NjcgYy0wLjU5MS01LjktMS4xNDktMTEuNDc2LTAuMjU2LTE3LjA5YzIuMDQ3LTEyLjg2OSwxMS4wMzYtMjAuNTUzLDI0LjA0Ny0yMC41NTNjMy43MDEsMCw3LjQ4MywwLjYwOSwxMS4yNiwxLjgxMiBjLTQuNDIyLDguMTEtOC40MzgsMTUuODU0LTExLjk0NywyMy4wMzJjLTcuNDM3LDE1LjIxMi0xMi41NjcsMjcuODEtMTUuMjUyLDM3LjQ0Yy0xLjY1NSw1LjkzOS02LjA1MiwyMS43MjIsNC42NywyOS4xNjQgYzMuNDA1LDIuMzYzLDcuNzIyLDMuMTk3LDEyLjIxNSwyLjM2MWM0LjA0OS0wLjc1MiwxNi4zNjktMy4wNDEsNTEuMzc4LTQyLjg5NmM5LjM5Ni0xMC42OTUsMTkuNTIxLTIzLjA3MiwzMC4xMDQtMzYuNzk0IGMyNy4xNjgtOS4xNSw0OC4zMS0zMS45MjEsNTMuOTAzLTU4LjA4N2MxLjQtNi41NDEsMS45ODQtMTMuNTQxLDEuNzM1LTIwLjgxMmMxMC4xNzItMTUuNzIsMTkuMDk0LTMwLjM4OCwyOC4wNzItNDYuMTU2IGMwLjE3Mi0wLjMwNCwwLjM0Mi0wLjYyOCwwLjUxLTAuOTZjMTMuMDMxLTMuNTY5LDI0LjI1NC0xMy43MSwzMC44NDItMjcuODkxQzQzNC44NzIsMTA2LjAyOCw0MzQuMTYzLDc5LjQyOCw0MjMuMjU3LDUxLjgyOXogTTI3Ni4zODUsMTQ5LjgzNGMtNC43MTMsNy40ODUtMTIuODE0LDExLjk1NC0yMS42NzMsMTEuOTU0Yy00LjgxLDAtOS41MTUtMS4zNjEtMTMuNjA1LTMuOTM3IGMtNS43ODItMy42NDItOS44MDMtOS4zMTctMTEuMzE2LTE1Ljk4cy0wLjM0NS0xMy41MTgsMy4yOTgtMTkuMzAxYzQuNzE0LTcuNDg1LDEyLjgxNi0xMS45NTQsMjEuNjc1LTExLjk1NCBjNC44MTEsMCw5LjUxNSwxLjM2MSwxMy42MDQsMy45MzhjNS43ODIsMy42NCw5LjgwMiw5LjMxNSwxMS4zMTYsMTUuOTc5QzI4MS4xOTcsMTM3LjE5NywyODAuMDI2LDE0NC4wNTEsMjc2LjM4NSwxNDkuODM0eiBNMzA5LjU5MiwxOTYuMTg3YzEyLjkzNC0xOS4wNTcsMjYuNjEyLTM4LDM5LjYwNC01NC44NWMyLjEwNiwxLjkwMiw0LjQ2MSwzLjc2LDcuMDEyLDUuNTNjNC4yMjcsMi45MzMsOC42NDgsNS4yMDEsMTMuMTY0LDYuNzU0IGMtMTAuOTY5LDE4Ljc1OC0yMi43NjMsMzcuMzQyLTM3LjA0Myw1OC4zNzVjLTIzLjQ2MywzNC41NzEtNDcuODU5LDY2LjY4NC02OC42OTUsOTAuNDI0IGMtMTEuNjM4LDEzLjI2LTIxLjgyMywyMy40OTgtMjkuNjcxLDI5LjgzOWMzLjAyOS05LjY5LDguODE4LTIyLjk4OSwxNi44NzUtMzguNzQ2IEMyNjUuMjQ1LDI2NS4zMzYsMjg2LjExMSwyMzAuNzcyLDMwOS41OTIsMTk2LjE4N3ogTTgyLjUwNiwxOTYuMDIzYy00LjgxMSwwLTkuNTE2LTEuMzYxLTEzLjYwNy0zLjkzOCBjLTUuNzgyLTMuNjQxLTkuODAxLTkuMzE0LTExLjMxNS0xNS45NzljLTEuNTE0LTYuNjY0LTAuMzQyLTEzLjUxOSwzLjMwMS0xOS4zMDJjNC43MTEtNy40ODQsMTIuODEzLTExLjk1MywyMS42NzEtMTEuOTUzIGM0LjgxMiwwLDkuNTE3LDEuMzYxLDEzLjYwNywzLjkzOGMxMS45MzYsNy41MTgsMTUuNTMyLDIzLjM0NSw4LjAxOSwzNS4yNzlDOTkuNDY2LDE5MS41NTQsOTEuMzYzLDE5Ni4wMjMsODIuNTA2LDE5Ni4wMjN6IE01NS42ODgsMjUyLjM1OGM0LjcxMy03LjQ4NiwxMi44MTQtMTEuOTU1LDIxLjY3My0xMS45NTVjNC44MSwwLDkuNTE0LDEuMzYyLDEzLjYwNiwzLjkzOGM1Ljc4MiwzLjY0MSw5LjgwMSw5LjMxNSwxMS4zMTUsMTUuOTc5IGMxLjUxNSw2LjY2MiwwLjM0MywxMy41MTYtMy4zMDEsMTkuMzAxYy00LjcxMSw3LjQ4My0xMi44MTMsMTEuOTUzLTIxLjY3MSwxMS45NTNjLTQuODExLDAtOS41MTctMS4zNjEtMTMuNjA5LTMuOTM4IGMtNS43ODItMy42NDItOS44LTkuMzE1LTExLjMxMy0xNS45NzlDNTAuODc2LDI2NC45OTUsNTIuMDQ5LDI1OC4xNCw1NS42ODgsMjUyLjM1OHogTTEzNy42MiwxMDAuNDE0IGM0LjcxMy03LjQ4NSwxMi44MTUtMTEuOTU0LDIxLjY3My0xMS45NTRjNC44MDksMCw5LjUxNCwxLjM2MSwxMy42MDQsMy45MzdjMTEuOTM3LDcuNTE2LDE1LjUzMywyMy4zNDQsOC4wMTksMzUuMjggYy00LjcxNSw3LjQ4Ni0xMi44MTcsMTEuOTU1LTIxLjY3NSwxMS45NTVjLTQuODEsMC05LjUxNS0xLjM2MS0xMy42MDUtMy45MzhjLTUuNzgxLTMuNjQtOS43OTktOS4zMTQtMTEuMzEzLTE1Ljk3OSBDMTMyLjgwNywxMTMuMDUyLDEzMy45NzksMTA2LjE5OCwxMzcuNjIsMTAwLjQxNHoiLz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8Zz4gPC9nPiA8L3N2Zz4g"

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPiA8cG9seWdvbiBwb2ludHM9IjM2MSw4Ljc4OSAzNjEsOTAgNDQyLjIxMSw5MCAiLz4gPHBvbHlnb24gcG9pbnRzPSIzMTYsMjE0Ljc1IDI4MC45OTQsMjQxIDMyNC45OTQsMjc0LjAwMyAzMDcuMDA2LDI5Ny45OTcgMTk2LDIxNC43NSA2MSwzMjMuMTc0IDYxLDM2MSA0NTEsMzYxIDQ1MSwzMjMuMTc0ICIvPiA8cGF0aCBkPSJNMTY2LDkwYy04LjI3NiwwLTE1LDYuNzI0LTE1LDE1czYuNzI0LDE1LDE1LDE1czE1LTYuNzI0LDE1LTE1UzE3NC4yNzYsOTAsMTY2LDkweiIvPiA8cGF0aCBkPSJNNjEsMzkxdjEyMWgzOTBWMzkxSDYxeiBNMzMxLDQ1MUgxODF2LTMwaDE1MFY0NTF6Ii8+IDxwYXRoIGQ9Ik0zMzEsMTIwVjBINjF2Mjg0Ljg3NEwxOTYsMTc3LjI1bDYwLjAwMiw0NS4wMDVMMzE2LDE3Ny4yNWwxMzUsMTA3LjYyNFYxMjBIMzMxeiBNMTY2LDE1MGMtMjQuODE0LDAtNDUtMjAuMTg2LTQ1LTQ1IGMwLTI0LjgxNCwyMC4xODYtNDUsNDUtNDVjMjQuODE0LDAsNDUsMjAuMTg2LDQ1LDQ1QzIxMSwxMjkuODE0LDE5MC44MTQsMTUwLDE2NiwxNTB6Ii8+IDwvc3ZnPiA="

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTI0MSA0NTFoMzB2MzBoLTMweiIvPjxwYXRoIGQ9Im0yNDEgMzkxaDMwdjMwaC0zMHoiLz48cGF0aCBkPSJtMjQxIDMzMWgzMHYzMGgtMzB6Ii8+PHBhdGggZD0ibTI0MSAyNzFoMzB2MzBoLTMweiIvPjxwYXRoIGQ9Im0yNDEgMjExaDMwdjMwaC0zMHoiLz48cGF0aCBkPSJtMjQxIDE1MWgzMHYzMGgtMzB6Ii8+PHBhdGggZD0ibTI0MSA5MWgzMHYzMGgtMzB6Ii8+PHBhdGggZD0ibTI0MSAzMWgzMHYzMGgtMzB6Ii8+PHBhdGggZD0ibTAgNDMzLjYyNSAyMDYtNjYuNzE2di0yMTEuMjQ5bC0yMDYtNzguNDJ6Ii8+PHBhdGggZD0ibTMwNiAxNTUuNjZ2MjExLjI0OWwyMDYgNjYuNzE2di0zNTYuMzg1eiIvPjwvZz48L3N2Zz4g"

/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTE2Ljk1OHB4IiBoZWlnaHQ9IjExNi45NThweCIgdmlld0JveD0iMCAwIDExNi45NTggMTE2Ljk1OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTE2Ljk1OCAxMTYuOTU4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+IDxwYXRoIGQ9Ik01OC40NzIsOTIuMzI0YzEuMDQyLDAsMi4wMjUtMC40MDgsMi43NjItMS4xNDVsMjQuODY0LTI0Ljg2NWMwLjczOS0wLjczNiwxLjE0NS0xLjcyMSwxLjE0NS0yLjc2MiBzLTAuNDA1LTIuMDI2LTEuMTQ1LTIuNzY0bC0yNC44Ni0yNC44NjJjLTEuNDc3LTEuNDc0LTQuMDQ4LTEuNDc0LTUuNTI0LDBMMzAuODQ2LDYwLjc5Yy0wLjczNiwwLjczNi0xLjE0NSwxLjcyMy0xLjE0NSwyLjc2NCBzMC40MDgsMi4wMjQsMS4xNDUsMi43NjJsMjQuODYzLDI0Ljg2NEM1Ni40NDYsOTEuOTE2LDU3LjQzLDkyLjMyNCw1OC40NzIsOTIuMzI0eiIvPiA8cGF0aCBkPSJNMTAxLjIzNywzMS41NzdjLTguNTQzLTExLjQxOS0yMS4wMjItMTguODMyLTM1LjEzOC0yMC44NzNjLTguNTYyLTEuMjMxLTE3LjI4My0wLjM2Ni0yNS40MTcsMi41MzNMMzQuOTc0LDEuODMzIGMtMC41NjQtMS4xMjktMS43NDctMS45NDgtMy4xODYtMS44MTljLTEuMzQ3LDAuMDk2LTIuNDg4LDAuOTgtMi45MTEsMi4yNTVsLTcuMzcxLDIyLjExN2MtMC41NzIsMS43MjQsMC4zNjIsMy42MDIsMi4wOTksNC4xODggbDIyLjExMyw3LjM2N2MxLjI1MSwwLjQwOCwyLjY5LDAuMDE1LDMuNTQ0LTAuOTczYzAuODg1LTEuMDE2LDEuMDY0LTIuNDUzLDAuNDYyLTMuNjUxbC01LjUyNS0xMS4wNDEgYzYuNjc3LTIuMjE3LDEzLjc5Mi0yLjg1LDIwLjc4Ni0xLjgzNWMxMi4wNTIsMS43MzYsMjIuNzAxLDguMDY0LDI5Ljk5NiwxNy44MjFjNy4yNzQsOS43MzIsMTAuMzI0LDIxLjczNSw4LjU4NCwzMy43OTkgYy0xLjc0LDEyLjA2Mi04LjA2MiwyMi43MTYtMTcuNzk0LDI5Ljk5NWMtOS43MjMsNy4yNzEtMjEuNzc4LDEwLjM0NC0zMy44MDcsOC42MDZjLTEyLjA1Mi0xLjczNS0yMi43MDEtOC4wNjMtMjkuOTkyLTE3LjgxOSBjLTUuODE0LTcuNzY5LTguOTUtMTYuOTg2LTkuMDc2LTI2LjY1NGMtMC4wMjctMi4xMjktMS43ODItMy44NTYtMy45NTctMy44NTZjLTIuMTU2LDAuMDMtMy44ODQsMS44MDUtMy44NTcsMy45NiBDNS4yMyw3NS42MjEsOC45MDksODYuNDIxLDE1LjcxNSw5NS41MjljOC41MzksMTEuNDE4LDIxLjAxNCwxOC44MzIsMzUuMTMxLDIwLjg3M2MyLjU3NSwwLjM2OSw1LjE3NywwLjU1Nyw3LjczNywwLjU1NyBjMTEuNTM3LDAsMjIuNTU2LTMuNjgyLDMxLjg2NS0xMC42NDVjMTEuNDIzLTguNTQzLDE4LjgzNi0yMS4wMiwyMC44NjktMzUuMTM1QzExMy4zNTgsNTcuMDY2LDEwOS43NzUsNDMsMTAxLjIzNywzMS41Nzd6Ii8+IDwvc3ZnPiA="

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFControl = exports.IIIFLayer = void 0;
const event_1 = __webpack_require__(1);
const layer_1 = __webpack_require__(2);
Object.defineProperty(exports, "IIIFLayer", ({ enumerable: true, get: function () { return layer_1.IIIFLayer; } }));
const toolbar_1 = __webpack_require__(8);
Object.defineProperty(exports, "IIIFControl", ({ enumerable: true, get: function () { return toolbar_1.IIIFControl; } }));
__webpack_require__(9);
window.L["Iiif"] = { Event: event_1.IIIF_EVENTS };
window.L.tileLayer["iiif"] = function (url, options) {
    return new layer_1.IIIFLayer(url, options);
};
window.L.control["iiif"] = function (layer, options) {
    return new toolbar_1.IIIFControl(layer, options);
};

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=leaflet-iiif.js.map