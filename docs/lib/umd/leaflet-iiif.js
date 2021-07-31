(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("leaflet"));
	else if(typeof define === 'function' && define.amd)
		define(["leaflet"], factory);
	else if(typeof exports === 'object')
		exports["leaflet-iiif"] = factory(require("leaflet"));
	else
		root["leaflet-iiif"] = factory(root["L"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__4__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports) => {


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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFLayer = void 0;
const tslib_1 = __webpack_require__(3);
const leaflet_1 = tslib_1.__importStar(__webpack_require__(4));
const types_1 = __webpack_require__(5);
const event_1 = __webpack_require__(1);
const server_capabilities_1 = __webpack_require__(6);
const helper_1 = __webpack_require__(7);
const projection_1 = __webpack_require__(8);
class IIIFLayer extends leaflet_1.TileLayer {
    constructor(url, options = {}) {
        super(url, options);
        this.map = null;
        this._url = "";
        this.server = types_1.SERVER_CAPABILITIES_DEFAULT;
        this.height = 0;
        this.width = 0;
        this.zoomLayers = [];
        this.setUrl(helper_1.templateUrl(url));
    }
    initialize(url, options) {
        this.initializePromise = new Promise((resolve, reject) => {
            fetch(url)
                .then(response => {
                response
                    .json()
                    .then(data => {
                    this.height = data.height;
                    this.width = data.width;
                    this.server = server_capabilities_1.computeServerCapabilities(data);
                    this.options = leaflet_1.default.Util.setOptions(this, Object.assign({}, types_1.DEFAULT_OPTIONS, {
                        tileSize: this.server.tileSize,
                        tileFormat: this.server.formats[0],
                        quality: this.server.qualities.includes("native") ? "native" : "default",
                        minZoom: this.server.minZoom,
                        maxZoom: this.server.maxZoom,
                    }, options));
                    resolve();
                })
                    .catch((e) => reject(e));
            })
                .catch((e) => reject(e));
        });
        return this;
    }
    onAdd(map) {
        this.map = map;
        this.initializePromise.then(() => {
            this.computeZoomLayers();
            super.onAdd(map);
            if (this.options.fitBounds) {
                this.map.fitBounds(this.getBounds());
            }
            if (this.options.setMaxBounds) {
                this.map.setMaxBounds(this.getBounds());
            }
        });
        this.registerEvents(map);
        return this;
    }
    onRemove(map) {
        super.onRemove(map);
        if (this.options.setMaxBounds) {
            map.setMaxBounds(null);
        }
        this.unRegisterEvents(map);
        return this;
    }
    getTileUrl(coords) {
        const z = coords["z"];
        const x = coords["x"];
        const y = coords["y"];
        const zoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
        if (!zoomLayer)
            throw new Error(`Can't create tile for zoom ${z}`);
        const unprojectedSquare = projection_1.projectSquare(-1 * this.options.rotation, {
            bottomLeft: { x, y },
            topRight: { x: x + 1, y: y + 1 },
        });
        const tileSizeX = this.options.tileSize.x / zoomLayer.scale;
        const tileSizeY = this.options.tileSize.y / zoomLayer.scale;
        let minX = Math.min(unprojectedSquare.bottomLeft.x * tileSizeX, this.width);
        const minY = Math.min(unprojectedSquare.bottomLeft.y * tileSizeY, this.height);
        let maxX = Math.min(minX + tileSizeX, this.width);
        const maxY = Math.min(minY + tileSizeY, this.height);
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
        const unprojectedSquare = projection_1.projectSquare(-1 * this.options.rotation, {
            bottomLeft: { x, y },
            topRight: { x: x + 1, y: y + 1 },
        });
        if (this.options.minZoom <= z && z <= this.options.maxZoom) {
            const originalZoomLayer = this.zoomLayers.find(layer => layer.zoom === z);
            if (originalZoomLayer &&
                0 <= unprojectedSquare.bottomLeft.x &&
                unprojectedSquare.bottomLeft.x < originalZoomLayer.tiles[0] &&
                0 <= unprojectedSquare.bottomLeft.y &&
                unprojectedSquare.bottomLeft.y < originalZoomLayer.tiles[1])
                isValid = true;
        }
        return isValid;
    }
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
        if (this.map !== null) {
            this.map.setMaxZoom(this.zoomLayers[this.zoomLayers.length - 1].zoom);
            this.map.setMinZoom(this.zoomLayers[0].zoom);
        }
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
        if (this.options.setMaxBounds && this.map !== null) {
            this.map.setMaxBounds(this.getBounds());
        }
        this.redraw();
    }
    changeMirroring(value) {
        this.options.mirroring = value;
        this.redraw();
    }
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__values": () => (/* binding */ __values),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_CONTROL_OPTIONS = exports.DEFAULT_OPTIONS = exports.SERVER_CAPABILITIES_DEFAULT = void 0;
const tslib_1 = __webpack_require__(3);
const leaflet_1 = tslib_1.__importDefault(__webpack_require__(4));
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
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeServerCapabilitiesForV1 = exports.computeServerCapabilities = void 0;
const tslib_1 = __webpack_require__(3);
const leaflet_1 = tslib_1.__importDefault(__webpack_require__(4));
const types_1 = __webpack_require__(5);
function computeServerCapabilities(data) {
    let uri = `${data["@context"]}`;
    if (data["@context"] instanceof Array) {
        uri = data["@context"][data["@context"].length - 1];
    }
    switch (uri) {
        case "http://library.stanford.edu/iiif/image-api/1.1/context.json":
            return computeServerCapabilitiesForV1(data);
        case "http://iiif.io/api/image/2/context.json":
            return computeServerCapabilitiesForV2(data);
        case "http://iiif.io/api/image/3/context.json":
        default:
            return computeServerCapabilitiesForV3(data);
    }
}
exports.computeServerCapabilities = computeServerCapabilities;
function computeServerCapabilitiesForV1(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "1.1";
    const match = `${data.profile}`.match(/^http:\/\/library.stanford.edu\/iiif\/image-api\/1.1\/compliance.html#(.*)$/);
    const level = match && match.length === 2 ? match[1] : "level0";
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
        default:
            capabilities.rotation = false;
            capabilities.formats = ["jpg"];
            capabilities.qualities = ["native"];
            break;
    }
    if (data.formats)
        capabilities.formats = data.formats;
    if (data.qualities)
        capabilities.qualities = data.qualities;
    if (data.tile_width)
        capabilities.tileSize = leaflet_1.default.point(data.tile_width, data.tile_height ? data.tile_height : data.tile_width);
    if (data.scale_factors && data.scale_factors.length > -1) {
        capabilities.minZoom =
            Math.log2(data.scale_factors[data.scale_factors.length - 1]) *
                (data.scale_factors[data.scale_factors.length - 1] > 1 ? -1 : 1);
        capabilities.maxZoom = Math.log2(data.scale_factors[0]) * (data.scale_factors[0] > 1 ? -1 : 1);
    }
    return capabilities;
}
exports.computeServerCapabilitiesForV1 = computeServerCapabilitiesForV1;
function computeServerCapabilitiesForV2(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "2.0";
    const level = data.profile[0];
    switch (level) {
        case "level2":
            capabilities.qualities = ["default", "bitonial"];
            capabilities.formats = ["jpg", "png"];
            break;
        case "level1":
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg", "png"];
            break;
        default:
            capabilities.qualities = ["default"];
            capabilities.formats = ["jpg"];
            break;
    }
    if (data.profile[1] && data.profile[1].formats)
        capabilities.formats = data.profile[1].formats;
    if (data.profile[1] && data.profile[1].qualities)
        capabilities.qualities = data.profile[1].qualities;
    if (data.profile[1] &&
        data.profile[1].supports &&
        (data.profile[1].supports.includes("rotationBy90s") || data.profile[1].supports.includes("rotationArbitrary")))
        capabilities.rotation = true;
    if (data.profile[1] && data.profile[1].supports && data.profile[1].supports.includes("mirroring"))
        capabilities.mirroring = true;
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
function computeServerCapabilitiesForV3(data) {
    const capabilities = Object.assign({}, types_1.SERVER_CAPABILITIES_DEFAULT);
    capabilities.version = "3.0";
    const level = data.profile;
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
    if (data.extraFormats && data.extraFormats instanceof Array)
        capabilities.formats = capabilities.formats.concat(data.extraFormats.filter((ef) => !capabilities.formats.includes(ef)));
    if (data.extraQualities && data.extraQualities instanceof Array)
        capabilities.qualities = capabilities.qualities.concat(data.extraQualities.filter((eq) => !capabilities.qualities.includes(eq)));
    if (data.extraFeatures &&
        (data.extraFeatures.includes("rotationBy90s") || data.extraFeatures.includes("rotationArbitrary")))
        capabilities.rotation = true;
    if (data.extraFeatures && data.extraFeatures.includes("mirroring"))
        capabilities.mirroring = true;
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
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.templateUrl = void 0;
function templateUrl(url) {
    return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}
exports.templateUrl = templateUrl;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.projectSquare = exports.projectPoint = void 0;
function projectPoint(rotation, point) {
    const rotationInRadian = (-1 * rotation * Math.PI) / 180;
    return {
        x: Math.round(point.x * Math.cos(rotationInRadian) - point.y * Math.sin(rotationInRadian)),
        y: Math.round(point.y * Math.cos(rotationInRadian) + point.x * Math.sin(rotationInRadian)),
    };
}
exports.projectPoint = projectPoint;
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
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFControl = void 0;
const tslib_1 = __webpack_require__(3);
const leaflet_1 = tslib_1.__importStar(__webpack_require__(4));
const event_1 = __webpack_require__(1);
const types_1 = __webpack_require__(5);
const CONTROL_NAME = "leaflet-control-iiif";
class IIIFControl extends leaflet_1.Control {
    constructor(layer, options = {}) {
        super(Object.assign({}, types_1.DEFAULT_CONTROL_OPTIONS, options));
        this.layer = layer;
        this._container = leaflet_1.default.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
    }
    onAdd(map) {
        const container = this.getContainer();
        if (!container)
            throw new Error("Container for control is undefined");
        this.layer.initializePromise.then(() => {
            if (this.options.quality.enabled === true) {
                const qualities = this.options.quality.values ? this.options.quality.values : this.layer.server.qualities;
                this.createActions(this._container, this.options.quality.title, `${CONTROL_NAME}-quality`, this.options.quality.html, qualities.map((quality) => {
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
            if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
                this.createButton(container, this.options.mirroring.title, `${CONTROL_NAME}-mirroring`, this.options.mirroring.html, () => {
                    map.fire(event_1.IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
                });
            }
        });
        return container;
    }
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
    createButton(container, title, className, innerHTML, fn) {
        const link = leaflet_1.default.DomUtil.create("a", className, container);
        link.title = title;
        link.innerHTML = innerHTML;
        leaflet_1.default.DomEvent.on(link, "mousedown dblclick", leaflet_1.default.DomEvent.stopPropagation).on(link, "click", fn, this);
        return link;
    }
}
exports.IIIFControl = IIIFControl;


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
var exports = {};

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IIIFControl = exports.IIIFLayer = void 0;
const event_1 = __webpack_require__(1);
const layer_1 = __webpack_require__(2);
Object.defineProperty(exports, "IIIFLayer", ({ enumerable: true, get: function () { return layer_1.IIIFLayer; } }));
const toolbar_1 = __webpack_require__(9);
Object.defineProperty(exports, "IIIFControl", ({ enumerable: true, get: function () { return toolbar_1.IIIFControl; } }));
window.L["Iiif"] = { Event: event_1.IIIF_EVENTS };
window.L.tileLayer["iiif"] = function (url, options) {
    return new layer_1.IIIFLayer(url, options);
};
window.L.control["iiif"] = function (layer, options) {
    return new toolbar_1.IIIFControl(layer, options);
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