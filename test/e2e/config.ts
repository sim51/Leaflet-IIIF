import { Browser, Page } from "puppeteer";
import { Map } from "leaflet";

export type Tests = Array<{
  name: string; // Name of the screenshot, without the extension like for example 'example-basic'
  url: string; // Url of the page to take in screenshot
  waitFor?: number; // Time to wait in ms before to take the screenshot
  scenario?: (browser: Browser, page: Page) => Promise<void>;
  failureThreshold?: number; // between 0 and 1, it's a percent. By default it's 0.
}>;

export const tests: Tests = [
  {
    name: "default",
    url: "http://localhost:8080/examples/simple.html",
    scenario: async (_browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("img.leaflet-tile-loaded");
    },
    waitFor: 1000,
  },
  {
    name: "quality",
    url: "http://localhost:8080/examples/simple.html",
    scenario: async (_browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("img.leaflet-tile-loaded");
      console.log("quality - Tile loaded");

      await page.evaluate(() => {
        const map = ((window as unknown) as { map: Map }).map;
        return new Promise<void>(resolve => {
          map.eachLayer(l =>
            l.on("load", () => {
              console.log("quality - load");
              resolve();
            }),
          );
          console.log("quality - Fire");
          map.fire("iiif:quality", { value: "bitonal" });
        });
      });
    },
    waitFor: 1000,
  },
  {
    name: "rotation",
    url: "http://localhost:8080/examples/rotation.html",
    scenario: async (_browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("#map0 img.leaflet-tile-loaded");
      await page.waitForSelector("#map90 img.leaflet-tile-loaded");
      await page.waitForSelector("#map180 img.leaflet-tile-loaded");
      await page.waitForSelector("#map270 img.leaflet-tile-loaded");
    },
    waitFor: 1000,
  },
  {
    name: "rotation-mirror",
    url: "http://localhost:8080/examples/rotation.html",
    scenario: async (_browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("#map0 img.leaflet-tile-loaded");
      await page.waitForSelector("#map90 img.leaflet-tile-loaded");
      await page.waitForSelector("#map180 img.leaflet-tile-loaded");
      await page.waitForSelector("#map270 img.leaflet-tile-loaded");
      console.log("rotation-mirror - Tiles loaded");
      await page.evaluate(() => {
        const maps = ((window as unknown) as { maps: Array<Map> }).maps;
        return Promise.all(
          maps.map(map => {
            return new Promise<void>(resolve => {
              map.eachLayer(l =>
                l.on("load", () => {
                  console.log("rotation-mirror - load");
                  resolve();
                }),
              );
              console.log("rotation-mirror - Fire");
              map.fire("iiif:mirroring", { value: true });
            });
          }),
        );
      });
    },
    waitFor: 1000,
  },
];
