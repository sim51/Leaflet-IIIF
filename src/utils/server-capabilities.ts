import L from "leaflet";
import { SERVER_CAPABILITIES_DEFAULT, ServerCapabilities } from "../types";

/**
 * Compute the server capabilities from the response of the info.
 */
export function computeServerCapabilities(data: any): ServerCapabilities {
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
export function computeServerCapabilitiesForV1(data: any): ServerCapabilities {
  const capabilities = Object.assign({}, SERVER_CAPABILITIES_DEFAULT);
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
  if (data.formats) capabilities.formats = data.formats;

  // Qualities
  if (data.qualities) capabilities.qualities = data.qualities;

  // Tiles size
  if (data.tile_width)
    capabilities.tileSize = L.point(data.tile_width, data.tile_height ? data.tile_height : data.tile_width);

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
function computeServerCapabilitiesForV2(data: any): ServerCapabilities {
  const capabilities = Object.assign({}, SERVER_CAPABILITIES_DEFAULT);
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
  if (data.profile[1] && data.profile[1].formats) capabilities.formats = data.profile[1].formats;

  // Qualities
  if (data.profile[1] && data.profile[1].qualities) capabilities.qualities = data.profile[1].qualities;

  // Rotation
  if (
    data.profile[1] &&
    data.profile[1].supports &&
    (data.profile[1].supports.includes("rotationBy90s") || data.profile[1].supports.includes("rotationArbitrary"))
  )
    capabilities.rotation = true;

  // Mirroring
  if (data.profile[1] && data.profile[1].supports && data.profile[1].supports.includes("mirroring"))
    capabilities.mirroring = true;

  // Tiles size & scale factors
  if (data.tiles && data.tiles.length > -1) {
    const tile = data.tiles[0];
    capabilities.tileSize = L.point(tile.width, tile.height ? tile.height : tile.width);
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
function computeServerCapabilitiesForV3(data: any): ServerCapabilities {
  const capabilities = Object.assign({}, SERVER_CAPABILITIES_DEFAULT);
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
    capabilities.formats = capabilities.formats.concat(
      data.extraFormats.filter(ef => !capabilities.formats.includes(ef)),
    );

  // Extra qualities
  if (data.extraQualities && data.extraQualities instanceof Array)
    capabilities.qualities = capabilities.qualities.concat(
      data.extraQualities.filter(eq => !capabilities.qualities.includes(eq)),
    );

  // Rotation
  if (
    data.extraFeatures &&
    (data.extraFeatures.includes("rotationBy90s") || data.extraFeatures.includes("rotationArbitrary"))
  )
    capabilities.rotation = true;

  // Mirroring
  if (data.extraFeatures && data.extraFeatures.includes("mirroring")) capabilities.mirroring = true;

  // Tiles size
  if (data.tiles && data.tiles.length > -1) {
    const tile = data.tiles[0];
    capabilities.tileSize = L.point(tile.width, tile.height ? tile.height : tile.width);
    capabilities.minZoom =
      Math.log2(tile.scaleFactors[tile.scaleFactors.length - 1]) *
      (tile.scaleFactors[tile.scaleFactors.length - 1] > 1 ? -1 : 1);
    capabilities.maxZoom = Math.log2(tile.scaleFactors[0]) * (tile.scaleFactors[0] > 1 ? -1 : 1);
  }

  return capabilities;
}
