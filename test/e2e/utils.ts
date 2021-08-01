import Webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { Tests } from "./config";

// to avoid implicit any error
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackConfig = require("./../../webpack.config");

/**
 * Take the screenshots.
 *
 * @param {Array<Tests>} tests List of pages that should be taking in screenshot
 * @param {string} folder Path where to saved the screenshots
 * @param {string} suffix The filename will be suffixed with it
 */
export async function takeScreenshots(tests: Tests, folder: string, suffix = ""): Promise<void> {
  // Launch the browser
  const browser = await puppeteer.launch({
    defaultViewport: { width: 800, height: 800 },
  });

  // for each pages
  try {
    await Promise.all(
      tests.map(test => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<void>(async (resolve, reject) => {
          try {
            // Open a new page
            const page = await browser.newPage();

            // Navigate to URL
            try {
              await page.goto(test.url);
            } catch (e) {
              reject(e);
            }

            // Run scenario
            if (test.scenario) {
              try {
                await Promise.race([
                  test.scenario(browser, page),
                  new Promise((_resolve, reject) => {
                    setTimeout(() => {
                      console.log("scenario timeout");
                      reject();
                    }, 5000);
                  }),
                ]);
              } catch (e) {
                console.log("reject scenario");
                reject(e);
              }
            }

            // Taking the screenshot
            console.log("Taking screenshot");
            setTimeout(async () => {
              // Take the screenshot
              try {
                await page.screenshot({ path: path.resolve(`${folder}/${test.name}.${suffix}.png`) });
                console.log(`${test.url} saved in ${test.name}.${suffix}.png`);
                resolve();
              } catch (e) {
                reject(e);
              }
            }, test.waitFor || 0);
          } catch (e) {
            reject(e);
          }
        });
      }),
    );
  } catch (e) {
    throw new Error();
  } finally {
    console.log("Closing browser");
    // Close the browser
    await browser.close();
  }
  return;
}

/**
 * Make a diff between two images.
 *
 * @param {string} image1 path to the first image
 * @param {string} image2 path to the second image
 * @param {string} diffFilename path for the diff image that will be generated
 * @returns An object with the number of pixel that are diff, and the percent of change
 */
export function imageDiff(image1: string, image2: string, diffFilename: string): { diff: number; percent: number } {
  const img1 = PNG.sync.read(fs.readFileSync(path.resolve(image1)));
  const img2 = PNG.sync.read(fs.readFileSync(path.resolve(image2)));
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  const nbPixelInDiff: number = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(path.resolve(diffFilename), PNG.sync.write(diff));

  return { diff: nbPixelInDiff, percent: nbPixelInDiff / (width * height) };
}

export function startExampleServer(): Promise<WebpackDevServer> {
  return new Promise(resolve => {
    const compiler = Webpack(webpackConfig);
    const devServerOptions = Object.assign({}, webpackConfig.devServer, {
      open: false,
      stats: {
        colors: true,
      },
    });
    const server = new WebpackDevServer(compiler, devServerOptions);
    server.listen(8080, "127.0.0.1", () => {
      resolve(server);
    });
  });
}
