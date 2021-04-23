(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("leaflet"));
	else if(typeof define === 'function' && define.amd)
		define(["leaflet"], factory);
	else if(typeof exports === 'object')
		exports["leaflet-iiif"] = factory(require("leaflet"));
	else
		root["leaflet-iiif"] = factory(root["L"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__3__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IIIF_EVENTS": () => (/* binding */ IIIF_EVENTS)
/* harmony export */ });
const IIIF_EVENTS = {
    CHANGE_FORMAT: "iiif:format",
    CHANGE_QUALITY: "iiif:quality",
    CHANGE_ROTATION: "iiif:rotation",
    CHANGE_MIRRORING: "iiif:mirroring",
};


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IIIFLayer": () => (/* binding */ IIIFLayer)
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1);
/* harmony import */ var _utils_server_capabilities__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _utils_helper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _utils_projection__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






class IIIFLayer extends leaflet__WEBPACK_IMPORTED_MODULE_0__.TileLayer {
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
        this.server = _types__WEBPACK_IMPORTED_MODULE_1__.SERVER_CAPABILITIES_DEFAULT;
        // Dimension of the image
        this.height = 0;
        this.width = 0;
        this.zoomLayers = [];
        this.setUrl((0,_utils_helper__WEBPACK_IMPORTED_MODULE_4__.templateUrl)(url));
    }
    /**
     * Initialize the layer by calling the info endpoint of the image,
     * compute the server capabilities and set the initial state.
     */
    initialize(url, options) {
        // eslint-disable-next-line no-async-promise-executor
        this.initializePromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Calling the iiif info endpoint
                const response = yield fetch(url);
                const data = yield response.json();
                // saving the image dimension
                this.height = data.height;
                this.width = data.width;
                // server capabilities
                this.server = (0,_utils_server_capabilities__WEBPACK_IMPORTED_MODULE_3__.computeServerCapabilities)(data);
                // Settings
                this.options = leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, Object.assign({}, _types__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_OPTIONS, 
                // Server pref
                {
                    tileSize: this.server.tileSize,
                    tileFormat: this.server.formats[0],
                    quality: this.server.qualities.includes("native") ? "native" : "default",
                    minZoom: this.server.minZoom,
                    maxZoom: this.server.maxZoom,
                }, 
                // User's options
                options));
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
        const unprojectedSquare = (0,_utils_projection__WEBPACK_IMPORTED_MODULE_5__.projectSquare)(-1 * this.options.rotation, {
            bottomLeft: { x, y },
            topRight: { x: x + 1, y: y + 1 },
        });
        const tileSizeX = this.options.tileSize.x / zoomLayer.scale;
        const tileSizeY = this.options.tileSize.y / zoomLayer.scale;
        // Compute the image region / bbox NW/SE
        let minX = Math.min(unprojectedSquare.bottomLeft.x * tileSizeX, this.width);
        const minY = Math.min(unprojectedSquare.bottomLeft.y * tileSizeY, this.height);
        let maxX = Math.min(minX + tileSizeX, this.width);
        const maxY = Math.min(minY + tileSizeY, this.height);
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
            rotation: (360 - this.options.rotation) % 360,
            size: [Math.abs(maxX - minX), Math.abs(maxY - minY)].map(s => Math.ceil(s * zoomLayer.scale)),
        };
        return leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.template(this._url, {
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
        const unprojectedSquare = (0,_utils_projection__WEBPACK_IMPORTED_MODULE_5__.projectSquare)(-1 * this.options.rotation, {
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
        let result = leaflet__WEBPACK_IMPORTED_MODULE_0___default().latLngBounds([0, 1], [1, 0]);
        const originalZoomLayer = this.zoomLayers.find(layer => layer.scale === 1);
        if (this.map !== null && originalZoomLayer) {
            const projectedSquare = (0,_utils_projection__WEBPACK_IMPORTED_MODULE_5__.projectSquare)(this.options.rotation, {
                bottomLeft: { x: 0, y: originalZoomLayer.height },
                topRight: { x: originalZoomLayer.width, y: 0 },
            });
            const sw = this.map.unproject(leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(projectedSquare.bottomLeft), 0);
            const ne = this.map.unproject(leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(projectedSquare.topRight), 0);
            result = leaflet__WEBPACK_IMPORTED_MODULE_0___default().latLngBounds(sw, ne);
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
        /* eslint-disable @typescript-eslint/no-explicit-any */
        map.on(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_FORMAT, (e) => this.changeFormat(e.value));
        map.on(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_QUALITY, (e) => this.changeQuality(e.value));
        map.on(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_ROTATION, (e) => this.changeRotation(e.value));
        map.on(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_MIRRORING, (e) => this.changeMirroring(e.value));
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    unRegisterEvents(map) {
        this.off("tileload", this.onTileLoadStyle);
        /* eslint-disable @typescript-eslint/no-explicit-any */
        map.off(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_FORMAT, (e) => this.changeFormat(e.value));
        map.off(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_QUALITY, (e) => this.changeQuality(e.value));
        map.off(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_ROTATION, (e) => this.changeRotation(e.value));
        map.off(_event__WEBPACK_IMPORTED_MODULE_2__.IIIF_EVENTS.CHANGE_MIRRORING, (e) => this.changeMirroring(e.value));
        /* eslint-enable @typescript-eslint/no-explicit-any */
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


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SERVER_CAPABILITIES_DEFAULT": () => (/* binding */ SERVER_CAPABILITIES_DEFAULT),
/* harmony export */   "DEFAULT_OPTIONS": () => (/* binding */ DEFAULT_OPTIONS),
/* harmony export */   "DEFAULT_CONTROL_OPTIONS": () => (/* binding */ DEFAULT_CONTROL_OPTIONS)
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);

const SERVER_CAPABILITIES_DEFAULT = {
    version: "3.0",
    formats: [],
    qualities: [],
    rotation: false,
    mirroring: false,
    tileSize: null,
    minZoom: 0,
    maxZoom: 0,
};
const DEFAULT_OPTIONS = {
    tileSize: leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(256, 256),
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
const DEFAULT_CONTROL_OPTIONS = {
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computeServerCapabilities": () => (/* binding */ computeServerCapabilities),
/* harmony export */   "computeServerCapabilitiesForV1": () => (/* binding */ computeServerCapabilitiesForV1)
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);


/* eslint-disable  @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
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
/**
 * Compute the server capabilities for a IIIF server in v1.1.
 * @see https://iiif.io/api/image/1.1/compliance/
 */
function computeServerCapabilitiesForV1(data) {
    const capabilities = Object.assign({}, _types__WEBPACK_IMPORTED_MODULE_1__.SERVER_CAPABILITIES_DEFAULT);
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
        capabilities.tileSize = leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(data.tile_width, data.tile_height ? data.tile_height : data.tile_width);
    // Scale factors
    if (data.scale_factors && data.scale_factors.length > -1) {
        capabilities.minZoom =
            Math.log2(data.scale_factors[data.scale_factors.length - 1]) *
                (data.scale_factors[data.scale_factors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(data.scale_factors[0]) * (data.scale_factors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}
/**
 * Compute the server capabilities for a IIIF server in v2.0.
 * @see https://iiif.io/api/image/2.0/#successful-responses
 */
function computeServerCapabilitiesForV2(data) {
    const capabilities = Object.assign({}, _types__WEBPACK_IMPORTED_MODULE_1__.SERVER_CAPABILITIES_DEFAULT);
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
        capabilities.tileSize = leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(tile.width, tile.height ? tile.height : tile.width);
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
    const capabilities = Object.assign({}, _types__WEBPACK_IMPORTED_MODULE_1__.SERVER_CAPABILITIES_DEFAULT);
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
        capabilities.tileSize = leaflet__WEBPACK_IMPORTED_MODULE_0___default().point(tile.width, tile.height ? tile.height : tile.width);
        capabilities.minZoom =
            Math.log2(tile.scaleFactors[tile.scaleFactors.length - 1]) *
                (tile.scaleFactors[tile.scaleFactors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(tile.scaleFactors[0]) * (tile.scaleFactors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}
/* eslint-enable  @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "templateUrl": () => (/* binding */ templateUrl)
/* harmony export */ });
/**
 * Construct the tiles url template from the iiif image url
 */
function templateUrl(url) {
    return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "projectPoint": () => (/* binding */ projectPoint),
/* harmony export */   "projectSquare": () => (/* binding */ projectSquare)
/* harmony export */ });
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


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IIIFControl": () => (/* binding */ IIIFControl)
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);



const CONTROL_NAME = "leaflet-control-iiif";
class IIIFControl extends leaflet__WEBPACK_IMPORTED_MODULE_0__.Control {
    /**
     * IIIF Control constructor.
     *
     * @param {object} options List of options for the control
     */
    constructor(layer, options = {}) {
        super(Object.assign({}, _types__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_CONTROL_OPTIONS, options));
        this.layer = layer;
        this._container = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
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
                            map.fire(_event__WEBPACK_IMPORTED_MODULE_1__.IIIF_EVENTS.CHANGE_QUALITY, { value: quality });
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
                            map.fire(_event__WEBPACK_IMPORTED_MODULE_1__.IIIF_EVENTS.CHANGE_FORMAT, { value: format });
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
                            map.fire(_event__WEBPACK_IMPORTED_MODULE_1__.IIIF_EVENTS.CHANGE_ROTATION, { value: Number.parseInt(rotation) });
                        },
                    };
                }));
            }
            // Mirroring
            if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
                this.createButton(container, this.options.mirroring.title, `${CONTROL_NAME}-mirroring`, this.options.mirroring.html, () => {
                    map.fire(_event__WEBPACK_IMPORTED_MODULE_1__.IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
                });
            }
        });
        return container;
    }
    /**
     * Create a button
     */
    createActions(container, title, className, innerHTML, actions) {
        const actionsWrapper = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create("div", className);
        this.createButton(actionsWrapper, title, className, innerHTML, () => {
            if (container.dataset.opened === className)
                container.dataset.opened = "";
            else
                container.dataset.opened = className;
        });
        const actionsList = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create("ul", className);
        actions.forEach(action => {
            const li = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create("li", "", actionsList);
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
        const link = leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomUtil.create("a", className, container);
        link.title = title;
        link.innerHTML = innerHTML;
        leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.on(link, "mousedown dblclick", (leaflet__WEBPACK_IMPORTED_MODULE_0___default().DomEvent.stopPropagation)).on(link, "click", fn, this);
        return link;
    }
}


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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IIIFLayer": () => (/* reexport safe */ _layer__WEBPACK_IMPORTED_MODULE_1__.IIIFLayer),
/* harmony export */   "IIIFControl": () => (/* reexport safe */ _toolbar__WEBPACK_IMPORTED_MODULE_2__.IIIFControl)
/* harmony export */ });
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _layer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _toolbar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);




window.L["Iiif"] = { Event: _event__WEBPACK_IMPORTED_MODULE_0__.IIIF_EVENTS };
window.L.tileLayer["iiif"] = function (url, options) {
    return new _layer__WEBPACK_IMPORTED_MODULE_1__.IIIFLayer(url, options);
};
window.L.control["iiif"] = function (layer, options) {
    return new _toolbar__WEBPACK_IMPORTED_MODULE_2__.IIIFControl(layer, options);
};

})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=leaflet-iiif.js.map