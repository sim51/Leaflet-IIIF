"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeServerCapabilitiesForV1 = exports.computeServerCapabilities = void 0;
const tslib_1 = require("tslib");
const leaflet_1 = tslib_1.__importDefault(require("leaflet"));
const types_1 = require("../types");
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
//# sourceMappingURL=server-capabilities.js.map