"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IIIFLayer = void 0;
const tslib_1 = require("tslib");
const leaflet_1 = tslib_1.__importStar(require("leaflet"));
const types_1 = require("./types");
const event_1 = require("./event");
const server_capabilities_1 = require("./utils/server-capabilities");
const helper_1 = require("./utils/helper");
const projection_1 = require("./utils/projection");
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
//# sourceMappingURL=layer.js.map