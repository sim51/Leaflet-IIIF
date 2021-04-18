import assert from "assert";
import { templateUrl } from "../../../src/utils/helper";

describe("Utils - templateUrl", () => {
  it("should work on a valid url", () => {
    const url = templateUrl("https://ids.lib.harvard.edu/ids/iiif/43183405/info.json");
    assert.equal(
      url,
      "https://ids.lib.harvard.edu/ids/iiif/43183405/{region}/{size}/{mirroring}{rotation}/{quality}.{format}",
    );
  });

  it("should work on a valid relative url", () => {
    const url = templateUrl("/ids/iiif/43183405/info.json");
    assert.equal(url, "/ids/iiif/43183405/{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
  });

  it("should work on an url that contains 'info.json'", () => {
    const url = templateUrl("https://info.json/iiif/1234567890/info.json");
    assert.equal(url, "https://info.json/iiif/1234567890/{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
  });
});
