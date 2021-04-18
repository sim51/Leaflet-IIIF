import assert from "assert";
import { projectPoint, projectSquare, Point, Square } from "../../../src/utils/projection";

/**
 * Helper function to create a random point.
 * Coordinates are in the range [-50, +50].
 */
function randomPoint(): Point {
  return {
    x: Math.round((Math.random() - 0.5) * 100),
    y: Math.round((Math.random() - 0.5) * 100),
  };
}

/**
 * Helper function to create a random square.
 */
function randomSquare(l = 1): Square {
  const p1 = randomPoint();
  const p2 = { x: p1.x + l, y: p1.y + l };
  return { bottomLeft: p1, topRight: p2 };
}

describe("Utils - projections", () => {
  describe("projectPoint", () => {
    it("should return the same result with a rotation at 0", () => {
      const point = randomPoint();
      assert.deepEqual(projectPoint(0, point), point);
    });
    it("should return the same result with a rotation at 360", () => {
      const point = randomPoint();
      assert.deepEqual(projectPoint(360, point), point);
    });
    it("should return the project point with a rotation at 90", () => {
      assert.deepEqual(projectPoint(90, { x: 0, y: 1 }), { x: 1, y: 0 }, "Failed at 90");
      assert.deepEqual(projectPoint(90, { x: 1, y: 0 }), { x: 0, y: -1 }, "Failed at 180");
      assert.deepEqual(projectPoint(90, { x: 0, y: -1 }), { x: -1, y: 0 }, "Failed at 270");
      assert.deepEqual(projectPoint(90, { x: -1, y: 0 }), { x: 0, y: 1 }, "Failed at 360");
    });
    it("should return the opposite point with a rotation at 180", () => {
      const point = randomPoint();
      assert.deepEqual(projectPoint(180, point), { x: -1 * point.x, y: -1 * point.y });
    });
    it("is a bijective function", () => {
      const point = randomPoint();
      const randomRotation = Math.round(Math.random() * 360);
      const projected = projectPoint(randomRotation, point);
      const unprojected = projectPoint(-randomRotation, projected);
      assert.deepEqual(unprojected, point);
    });
  });

  describe("projectSquare", () => {
    it("should return the same result with a rotation at 0", () => {
      const square = randomSquare();
      assert.deepEqual(projectSquare(0, square), square);
    });
    it("should return the same result with a rotation at 360", () => {
      const square = randomSquare();
      assert.deepEqual(projectSquare(360, square), square);
    });
    it("should return the opposite point with a rotation at 180", () => {
      const size = Math.round(Math.random() * 10);
      const square = randomSquare(size);
      const projectedTopRight = {
        x: -square.bottomLeft.x,
        y: -square.bottomLeft.y,
      };
      assert.deepEqual(projectSquare(180, square), {
        bottomLeft: {
          x: projectedTopRight.x - size,
          y: projectedTopRight.y - size,
        },
        topRight: projectedTopRight,
      });
    });
    it("is a bijective function", () => {
      const square = randomSquare();
      const randomRotation = Math.round(Math.random() * 360);
      const projected = projectSquare(randomRotation, square);
      const unprojected = projectSquare(-randomRotation, projected);
      assert.deepEqual(
        unprojected,
        square,
        `Failed with square ${JSON.stringify(square)} and rotation ${randomRotation}`,
      );
    });
  });
});
