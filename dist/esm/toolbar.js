import L, { Control } from "leaflet";
import { IIIF_EVENTS } from "./event";
import { DEFAULT_CONTROL_OPTIONS } from "./types";
const CONTROL_NAME = "leaflet-control-iiif";
export class IIIFControl extends Control {
    /**
     * IIIF Control constructor.
     *
     * @param {object} options List of options for the control
     */
    constructor(layer, options = {}) {
        super(Object.assign({}, DEFAULT_CONTROL_OPTIONS, options));
        this.layer = layer;
        this._container = L.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
    }
    onAdd(map) {
        const container = this.getContainer();
        // Waiting the init of the layer
        this.layer.initializePromise.then(() => {
            // Qualities
            if (this.options.quality.enabled === true) {
                const qualities = this.options.quality.values ? this.options.quality.values : this.layer.server.qualities;
                this.createActions(container, this.options.quality.title, `${CONTROL_NAME}-quality`, this.options.quality.html, qualities.map((quality) => {
                    return {
                        title: quality,
                        className: `${CONTROL_NAME}-quality-${quality}`,
                        innerHTML: quality,
                        fn: () => {
                            map.fire(IIIF_EVENTS.CHANGE_QUALITY, { value: quality });
                        },
                    };
                }));
            }
            // Formats
            if (this.options.format.enabled === true) {
                const formats = this.options.format.values ? this.options.format.values : this.layer.server.formats;
                this.createActions(container, this.options.format.title, `${CONTROL_NAME}-format`, this.options.format.html, formats.map((format) => {
                    return {
                        title: format,
                        className: `${CONTROL_NAME}-format-${format}`,
                        innerHTML: format,
                        fn: () => {
                            map.fire(IIIF_EVENTS.CHANGE_FORMAT, { value: format });
                        },
                    };
                }));
            }
            // Formats
            if (this.options.rotation.enabled === true && this.layer.server.rotation === true) {
                const rotations = this.options.rotation.values ? this.options.rotation.values : ["0", "90", "180", "270"];
                this.createActions(container, this.options.rotation.title, `${CONTROL_NAME}-rotation`, this.options.rotation.html, rotations.map((rotation) => {
                    return {
                        title: rotation,
                        className: `${CONTROL_NAME}-rotation-${rotation}`,
                        innerHTML: rotation,
                        fn: () => {
                            map.fire(IIIF_EVENTS.CHANGE_ROTATION, { value: Number.parseInt(rotation) });
                        },
                    };
                }));
            }
            // Mirroring
            if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
                this.createButton(container, this.options.mirroring.title, `${CONTROL_NAME}-mirroring`, this.options.mirroring.html, () => {
                    map.fire(IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
                });
            }
        });
        return container;
    }
    /**
     * Create a button
     */
    createActions(container, title, className, innerHTML, actions) {
        const actionsWrapper = L.DomUtil.create("div", className);
        this.createButton(actionsWrapper, title, className, innerHTML, () => {
            if (container.dataset.opened === className)
                container.dataset.opened = "";
            else
                container.dataset.opened = className;
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
    createButton(container, title, className, innerHTML, fn) {
        const link = L.DomUtil.create("a", className, container);
        link.title = title;
        link.innerHTML = innerHTML;
        L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation).on(link, "click", fn, this);
        return link;
    }
}
//# sourceMappingURL=toolbar.js.map