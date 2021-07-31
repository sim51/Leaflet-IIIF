## Leaflet-IIIF [![CI](https://github.com/sim51/Leaflet-IIIF/actions/workflows/test.yml/badge.svg)](https://github.com/sim51/Leaflet-IIIF/actions/workflows/test.yml)

A Leaflet plugin for viewing IIIF images.

You can find some online examples here : https://sim51.github.io/react-sigma-v2/examples/

This project is a fork of http://mejackreed.github.io/Leaflet-IIIF/
It's a complete rewrite of the project with typescript and some enhancements :

- Compatible with all version of IIIF (see `server-capabilities.ts` file)
- Rotation & mirroring support
- Leaflet toolbar
- Better zoom level nomenclature (level 0 is always the raw image)
- E2E tests

## How to install

You need to install this library and its peer dependencies :

```bash
$> npm install ow-leaflet-iiif leaflet
```

## How to use it

### Import

Package is composed of a css file (only needed for the control), a leaflet layer and a leaflet controler.

For the js part, everything is export in the package entrypoint, so you can do this

```javascript
import { IIIFLayer, IIIFControl, ...} from "ow-leaflet-iiif";
```

You can also import just the components you need, they are exposed under the folder `./lib/esm` :

```javascript
import { IIIFLayer, ...} from "react-sigma-v2/lib/esm/layer";
```

For the css, you need to import the file `./lib/leaflet-iiif.css`.

### Example

```javascript
const map = L.map("map", {
  center: [0, 0],
  crs: L.CRS.Simple,
  zoom: 0,
});

const layer = L.tileLayer.iiif("https://ids.lib.harvard.edu/ids/iiif/43183405/info.json", {});
layer.addTo(map);

const control = L.control.iiif(layer, {});
control.addTo(map);
```

You can check the available layer's options [here](https://sim51.github.io/Leaflet-IIIF/interfaces/iiiflayeroptions.html)

You can check the available control's options [here](https://sim51.github.io/Leaflet-IIIF/interfaces/iiifcontroloptions.html)

## Npm scripts

- `npm run build` : Build the project
- `npm run start` : Build the project (with live compiltation) and run the examples on <http://localhost:8080/examples>
- `npm run test` : Run the unit tests of the project
- `npm run e2e:test` : Run the e2e tests of the project
- `npm run e2e:generate` : Generate the reference screenshots for the e2e tests.
- `npm run site` : Generate the website (typedoc)

## Some screenshots

![Simple](https://raw.githubusercontent.com/sim51/leaflet-iiif/main/test/e2e/screenshots/default.valid.png)

![Rotation](https://raw.githubusercontent.com/sim51/leaflet-iiif/main/test/e2e/screenshots/rotation.valid.png)
