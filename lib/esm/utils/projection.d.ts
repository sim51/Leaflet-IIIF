export declare type Point = {
    x: number;
    y: number;
};
export declare type Square = {
    bottomLeft: Point;
    topRight: Point;
};
export declare function projectPoint(rotation: number, point: Point): Point;
export declare function projectSquare(rotation: number, square: Square): Square;
