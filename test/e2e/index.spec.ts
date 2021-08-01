import assert from "assert";
import path from "path";
import { imageDiff, startExampleServer, takeScreenshots } from "./utils";
import { tests } from "./config";

const DEFAULT_TEST_THRESHOLD = 0.0005;

before(function(done) {
  // No mocha timeout, but there is a timeout of 30sec in puppeteer loading pages
  this.timeout(0);

  // starting the server with examples
  startExampleServer().then(server => {
    console.log("~~~ Start generating screenshots ~~~");
    takeScreenshots(tests, path.resolve(`./test/e2e/screenshots`), "current")
      .then(() => {
        console.log("~~~ End generating screenshots ~~~");
      })
      .finally(() => server.close(done));
  });
});

describe("Compare screenshots", () => {
  tests.forEach(test => {
    it(`Screenshots for "${test.name}" should be the same`, () => {
      const result = imageDiff(
        path.resolve(`./test/e2e/screenshots/${test.name}.valid.png`),
        path.resolve(`./test/e2e/screenshots/${test.name}.current.png`),
        path.resolve(`./test/e2e/screenshots/${test.name}.diff.png`),
      );
      assert(
        result.percent <= (test.failureThreshold || DEFAULT_TEST_THRESHOLD),
        `There is a diff over ${test.failureThreshold || DEFAULT_TEST_THRESHOLD}  (${result.percent}) on ${
          test.name
        }, please check "${test.name}.diff.png"`,
      );
    });
  });
});
