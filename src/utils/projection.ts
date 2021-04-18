export type Point = { x: number; y: number };
export type Square = { bottomLeft: Point; topRight: Point };

/**
 * Rotation projection of a point around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param point The point to project
 * @returns The projected point for the specified rotation.
 */
export function projectPoint(rotation: number, point: Point): Point {
  // negate to follow the direction 180-0
  const rotationInRadian = (-1 * rotation * Math.PI) / 180;
  return {
    x: Math.round(point.x * Math.cos(rotationInRadian) - point.y * Math.sin(rotationInRadian)),
    y: Math.round(point.y * Math.cos(rotationInRadian) + point.x * Math.sin(rotationInRadian)),
  };
}

/**
 * Rotation projection of a square, around the origin 0,0.
 *
 * @param rotation The rotation in degree (ex: 90)
 * @param square The square to project
 * @returns The projected square for the specified rotation.
 */
export function projectSquare(rotation: number, square: Square): Square {
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
