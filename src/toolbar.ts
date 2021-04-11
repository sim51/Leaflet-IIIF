import L, { Control, Map } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIFControlOptions } from "./types";

const CONTROL_NAME = "leaflet-control-iiif";

export class IIIFControl extends Control {
  // Control options
  public options: IIIFControlOptions;

  layer: IIIFLayer;
  _container: HTMLElement;

  /**
   * IIIF Control constructor.
   *
   * @param {object} options List of options for the control
   */
  constructor(layer: IIIFLayer, options: Partial<IIIFControlOptions> = {}) {
    super(options);
    this.layer = layer;
    this._container = L.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
  }

  onAdd(map: Map): HTMLElement {
    const container = this.getContainer();

    // Waiting the init of the layer
    this.layer.initializePromise.then(() => {
      // Qualities
      this.layer.server.qualities.map((quality: string) => {
        this.createButton(`Quality ${quality}`, `${CONTROL_NAME}-quality`, quality, container, () => {
          this.layer.options.quality = quality;
          this.layer.redraw();
        });
      });

      // Formats
      this.layer.server.formats.map((format: string) => {
        this.createButton(`Format ${format}`, `${CONTROL_NAME}-format`, format, container, () => {
          this.layer.options.tileFormat = format;
          this.layer.redraw();
        });
      });

      // Mirroring
      if (this.layer.server.mirroring) {
        this.createButton(`Mirroring`, `${CONTROL_NAME}-mirroring`, "Mirroring", container, () => {
          this.layer.options.mirroring = !this.layer.options.mirroring;
          this.layer.redraw();
        });
      }
    });

    return container;
  }

  /**
   * Create a button
   */
  private createButton(
    title: string,
    className: string,
    innerHTML: string,
    container: HTMLElement,
    fn: () => void,
  ): HTMLElement {
    var link: HTMLElement = L.DomUtil.create("a", className, container);
    link.title = title;
    link.innerHTML = innerHTML;
    L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation).on(link, "click", fn, this);
    return link;
  }
}
