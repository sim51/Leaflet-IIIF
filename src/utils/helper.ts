import { TileUrlParams } from "../types";
import L from "leaflet";

/**
 * Construct the tiles url template from the iiif image url
 */
export function templateUrl(url: string): string {
  return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}
