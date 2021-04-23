export declare type Point = {
    x: number;
    y: number;
};
export declare type Square = {
    bottomLeft: Point;
    topRight: Point;
};
/**
 * Rotation projection of a point around the origin 0,0.
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
