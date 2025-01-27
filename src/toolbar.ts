import L, { Control, Map } from "leaflet";
import { IIIFLayer } from "./layer";
import { IIIF_EVENTS } from "./event";
import { DEFAULT_CONTROL_OPTIONS, IIIFControlOptions } from "./types";

const CONTROL_NAME = "leaflet-control-iiif";

/**
 * Control for the {@link IIIFLayer | IIIF layer}
 * Create a toolbar that allows you to control the layer's options.
 *
 * ```js
 * const control = new IIIFControl(layer, options);
 * control.addTo(map);
 * ```
 */
export class IIIFControl extends Control {
  /**
   * Options of the control (initialized by super)
   */
  public options!: IIIFControlOptions;

  /**
   * The IIIF layer on which the control takes affect
   */
  public layer: IIIFLayer;

  /**
   * The created html div container that will contains the toolbar
   */
  private _container: HTMLElement;

  /**
   * IIIF Control constructor.
   *
   * @param {object} options List of options for the control
   */
  constructor(layer: IIIFLayer, options: Partial<IIIFControlOptions> = {}) {
    super(Object.assign({}, DEFAULT_CONTROL_OPTIONS, options));
    this.layer = layer;
    this._container = L.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
  }

  /**
   * Add the control to Leaflet map
   */
  onAdd(map: Map): HTMLElement {
    const container = this.getContainer();
    if (!container) throw new Error("Container for control is undefined");
    // Waiting the init of the layer
    this.layer.initializePromise.then(() => {
      // Qualities
      if (this.options.quality.enabled === true) {
        const qualities = this.options.quality.values ? this.options.quality.values : this.layer.server.qualities;
        this.createActions(
          this._container,
          this.options.quality.title,
          `${CONTROL_NAME}-quality`,
          this.options.quality.html,
          qualities.map((quality: string) => {
            return {
              title: quality,
              className: `${CONTROL_NAME}-quality-${quality}`,
              innerHTML: quality,
              fn: () => {
                map.fire(IIIF_EVENTS.CHANGE_QUALITY, { value: quality });
              },
            };
          }),
        );
      }

      // Formats
      if (this.options.format.enabled === true) {
        const formats = this.options.format.values ? this.options.format.values : this.layer.server.formats;
        this.createActions(
          container,
          this.options.format.title,
          `${CONTROL_NAME}-format`,
          this.options.format.html,
          formats.map((format: string) => {
            return {
              title: format,
              className: `${CONTROL_NAME}-format-${format}`,
              innerHTML: format,
              fn: () => {
                map.fire(IIIF_EVENTS.CHANGE_FORMAT, { value: format });
              },
            };
          }),
        );
      }

      // Formats
      if (this.options.rotation.enabled === true && this.layer.server.rotation === true) {
        const rotations = this.options.rotation.values ? this.options.rotation.values : ["0", "90", "180", "270"];
        this.createActions(
          container,
          this.options.rotation.title,
          `${CONTROL_NAME}-rotation`,
          this.options.rotation.html,
          rotations.map((rotation: string) => {
            return {
              title: rotation,
              className: `${CONTROL_NAME}-rotation-${rotation}`,
              innerHTML: rotation,
              fn: () => {
                map.fire(IIIF_EVENTS.CHANGE_ROTATION, { value: Number.parseInt(rotation) });
              },
            };
          }),
        );
      }

      // Mirroring
      if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
        this.createButton(
          container,
          this.options.mirroring.title,
          `${CONTROL_NAME}-mirroring`,
          this.options.mirroring.html,
          () => {
            map.fire(IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
          },
        );
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

    const actionsList = L.DomUtil.create("ul", className);
    actions.forEach(action => {
      const li = L.DomUtil.create("li", "", actionsList);
      this.createButton(li, action.title, action.className, action.innerHTML, () => {
        action.fn();
        container.dataset.opened = "";
      });
      actionsList.appendChild(li);
    });
    actionsWrapper.appendChild(actionsList);

    container.appendChild(actionsWrapper);
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
    const link: HTMLElement = L.DomUtil.create("a", className, container);
    link.title = title;
    link.innerHTML = innerHTML;
    L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation).on(link, "click", fn, this);
    return link;
  }
}
