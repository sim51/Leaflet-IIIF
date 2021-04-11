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
      this.createActions(
        container,
        "Quality",
        `${CONTROL_NAME}-quality`,
        "Q",
        this.layer.server.qualities.map((quality: string) => {
          return {
            title: quality,
            className: `${CONTROL_NAME}-quality-${quality}`,
            innerHTML: quality,
            fn: () => {
              this.layer.options.quality = quality;
              this.layer.redraw();
            },
          };
        }),
      );

      // Formats
      this.createActions(
        container,
        "Format",
        `${CONTROL_NAME}-format`,
        "F",
        this.layer.server.formats.map((format: string) => {
          return {
            title: format,
            className: `${CONTROL_NAME}-format-${format}`,
            innerHTML: format,
            fn: () => {
              this.layer.options.tileFormat = format;
              this.layer.redraw();
            },
          };
        }),
      );

      // Mirroring
      if (this.layer.server.mirroring) {
        this.createButton(container, `Mirroring`, `${CONTROL_NAME}-mirroring`, "M", () => {
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
  private createActions(
    container: HTMLElement,
    title: string,
    className: string,
    innerHTML: string,
    actions: Array<{ title: string; className: string; innerHTML: string; fn: () => void }>,
  ) {
    const actionsWrapper = L.DomUtil.create("div", className);
    this.createButton(actionsWrapper, title, className, innerHTML, () => {
      if (container.dataset.opened === className) container.dataset.opened = "";
      else container.dataset.opened = className;
    });
    container.appendChild(actionsWrapper);

    const actionsList = L.DomUtil.create("ul", className);
    actions.forEach(action => {
      const li = L.DomUtil.create("li", "", actionsList);
      this.createButton(li, action.title, action.className, action.innerHTML, () => {
        action.fn();
        container.dataset.opened = "";
      });
      actionsList.appendChild(li);
    });
    container.appendChild(actionsList);
  }

  /**
   * Create a button
   */
  private createButton(
    container: HTMLElement,
    title: string,
    className: string,
    innerHTML: string,
    fn: () => void,
  ): HTMLElement {
    var link: HTMLElement = L.DomUtil.create("a", className, container);
    link.title = title;
    link.innerHTML = innerHTML;
    L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation).on(link, "click", fn, this);
    return link;
  }
}
