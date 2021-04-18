import { ServerCapabilities } from "../types";
/**
 * Compute the server capabilities from the response of the info.
 */
export declare function computeServerCapabilities(data: any): ServerCapabilities;
/**
 * Compute the server capabilities for a IIIF server in v1.1.
 * @see https://iiif.io/api/image/1.1/compliance/
 */
export declare function computeServerCapabilitiesForV1(data: any): ServerCapabilities;
