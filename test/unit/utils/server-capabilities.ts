import assert from "assert";
import * as cantaloupe from "../../assets/cantaloupe/info.json";
import * as edge_case from "../../assets/edge_case/info.json";
import * as mlk from "../../assets/mlk/info.json";
import * as profile_object from "../../assets/profile_object/info.json";
import * as v3 from "../../assets/v3/info.json";
import * as acrobat from "../../assets/acrobat_info.json";
import * as statue from "../../assets/statue_info.json";
import { computeServerCapabilities } from "../../../src/utils/server-capabilities";

const TESTS = [
  {
    name: "Cantaloupe",
    data: cantaloupe,
    expected: {
      formats: ["tif", "jpg", "gif", "png"],
      maxZoom: 0,
      minZoom: -5,
      mirroring: true,
      qualities: ["bitonal", "default", "gray", "color"],
      rotation: true,
      tileSize: {
        x: 2016,
        y: 1512,
      },
      version: "2.0",
    },
  },
  {
    name: "edge_case",
    data: edge_case,
    expected: {
      formats: ["jpg"],
      maxZoom: 0,
      minZoom: -5,
      mirroring: false,
      qualities: ["native"],
      rotation: true,
      tileSize: null,
      version: "1.1",
    },
  },
  {
    name: "mlk",
    data: mlk,
    expected: {
      formats: ["jpg"],
      maxZoom: 0,
      minZoom: -4,
      mirroring: false,
      qualities: ["default"],
      rotation: false,
      tileSize: {
        x: 1024,
        y: 1024,
      },
      version: "2.0",
    },
  },
  {
    name: "profile_object",
    data: profile_object,
    expected: {
      formats: ["jpg"],
      maxZoom: 0,
      minZoom: -4,
      mirroring: false,
      qualities: ["default"],
      rotation: false,
      tileSize: {
        x: 750,
        y: 750,
      },
      version: "2.0",
    },
  },
  {
    name: "v3",
    data: v3,
    expected: {
      formats: ["jpg", "png"],
      maxZoom: 0,
      minZoom: -1,
      mirroring: false,
      qualities: ["default", "color", "gray"],
      rotation: false,
      tileSize: {
        x: 512,
        y: 512,
      },
      version: "3.0",
    },
  },
  {
    name: "acrobat",
    data: acrobat,
    expected: {
      formats: ["jpg", "png", "gif", "webp"],
      maxZoom: 0,
      minZoom: -7,
      mirroring: true,
      qualities: ["default", "bitonal", "gray", "color"],
      rotation: true,
      tileSize: {
        x: 1024,
        y: 1024,
      },
      version: "2.0",
    },
  },
  {
    name: "statue",
    data: statue,
    expected: {
      formats: ["jpg"],
      maxZoom: 0,
      minZoom: -5,
      mirroring: false,
      qualities: ["native"],
      rotation: true,
      tileSize: {
        x: 1024,
        y: 1024,
      },
      version: "1.1",
    },
  },
];

describe("Server capabilities", () => {
  TESTS.map(test => {
    it(`should work for ${test.name}`, () => {
      assert.deepEqual(computeServerCapabilities(test.data), test.expected);
    });
  });
});
