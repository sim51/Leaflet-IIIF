"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSquare = exports.projectPoint = void 0;
function projectPoint(rotation, point) {
    const rotationInRadian = (-1 * rotation * Math.PI) / 180;
    return {
        x: Math.round(point.x * Math.cos(rotationInRadian) - point.y * Math.sin(rotationInRadian)),
        y: Math.round(point.y * Math.cos(rotationInRadian) + point.x * Math.sin(rotationInRadian)),
    };
}
exports.projectPoint = projectPoint;
function projectSquare(rotation, square) {
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
exports.projectSquare = projectSquare;
//# sourceMappingURL=projection.js.map