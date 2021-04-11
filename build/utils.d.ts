import { ServerCapabilities } from "./types";
/**
 * Construct the tiles url template from the iiif image url
 */
export declare function templateUrl(url: string): string;
/**
 * Compute the server capabilities from the response of the info.
 */
export declare function computeServerCapabilities(data: any): ServerCapabilities;
/**
 * Compute the server capabilities for a IIIF server in v1.1.
 * @see https://iiif.io/api/image/1.1/compliance/
 */
export declare function computeServerCapabilitiesForV1(data: any): ServerCapabilities;
