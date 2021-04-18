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
export declare type Point = {
    x: number;
    y: number;
};
export declare type Square = {
    topLeft: Point;
    bottomRight: Point;
};
/**
 * Rotation projection of a point, around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param point The point to project
 * @returns The projected point for the specified rotation.
 */
export declare function projectPoint(rotation: number, point: Point): Point;
/**
 * Rotation projection of a square, around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param square The square to project
 * @returns The projected square for the specified rotation.
 */
export declare function projectSquare(rotation: number, square: Square): Square;
