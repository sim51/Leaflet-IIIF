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
    url: "http://localhost:8080/examples/index.html",
    scenario: async (browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("img.leaflet-tile-loaded");
    },
    waitFor: 1000,
  },
  {
    name: "quality",
    url: "http://localhost:8080/examples/index.html",
    scenario: async (browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("img.leaflet-tile-loaded");
      await page.evaluate(() => {
        const map = (window as any).map as Map;
        return new Promise((resolve, reject) => {
          map.eachLayer(l =>
            l.on("loading", () => {
              l.on("load", resolve);
            }),
          );
          map.fire("iiif:quality", { value: "bitonal" });
        });
      });
    },
    waitFor: 1000,
  },
  {
    name: "rotation",
    url: "http://localhost:8080/examples/rotation.html",
    scenario: async (browser: Browser, page: Page): Promise<void> => {
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
    scenario: async (browser: Browser, page: Page): Promise<void> => {
      // waiting for images
      await page.waitForSelector("#map0 img.leaflet-tile-loaded");
      await page.waitForSelector("#map90 img.leaflet-tile-loaded");
      await page.waitForSelector("#map180 img.leaflet-tile-loaded");
      await page.waitForSelector("#map270 img.leaflet-tile-loaded");
      await page.evaluate(() => {
        const maps = (window as any).maps as Array<Map>;
        return Promise.all(
          maps.map(map => {
            return new Promise((resolve, reject) => {
              map.eachLayer(l =>
                // wait for new tile event
                l.on("loading", () => {
                  l.on("load", resolve); // wait for tiles finished to be loaded
                }),
              );
              map.fire("iiif:mirroring", { value: true });
            });
          }),
        );
      });
    },
    waitFor: 1000,
  },
];
