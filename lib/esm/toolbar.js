"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IIIFControl = void 0;
const tslib_1 = require("tslib");
const leaflet_1 = tslib_1.__importStar(require("leaflet"));
const event_1 = require("./event");
const types_1 = require("./types");
const CONTROL_NAME = "leaflet-control-iiif";
class IIIFControl extends leaflet_1.Control {
    constructor(layer, options = {}) {
        super(Object.assign({}, types_1.DEFAULT_CONTROL_OPTIONS, options));
        this.layer = layer;
        this._container = leaflet_1.default.DomUtil.create("div", `${CONTROL_NAME} leaflet-bar`);
    }
    onAdd(map) {
        const container = this.getContainer();
        if (!container)
            throw new Error("Container for control is undefined");
        this.layer.initializePromise.then(() => {
            if (this.options.quality.enabled === true) {
                const qualities = this.options.quality.values ? this.options.quality.values : this.layer.server.qualities;
                this.createActions(this._container, this.options.quality.title, `${CONTROL_NAME}-quality`, this.options.quality.html, qualities.map((quality) => {
                    return {
                        title: quality,
                        className: `${CONTROL_NAME}-quality-${quality}`,
                        innerHTML: quality,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_QUALITY, { value: quality });
                        },
                    };
                }));
            }
            if (this.options.format.enabled === true) {
                const formats = this.options.format.values ? this.options.format.values : this.layer.server.formats;
                this.createActions(container, this.options.format.title, `${CONTROL_NAME}-format`, this.options.format.html, formats.map((format) => {
                    return {
                        title: format,
                        className: `${CONTROL_NAME}-format-${format}`,
                        innerHTML: format,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_FORMAT, { value: format });
                        },
                    };
                }));
            }
            if (this.options.rotation.enabled === true && this.layer.server.rotation === true) {
                const rotations = this.options.rotation.values ? this.options.rotation.values : ["0", "90", "180", "270"];
                this.createActions(container, this.options.rotation.title, `${CONTROL_NAME}-rotation`, this.options.rotation.html, rotations.map((rotation) => {
                    return {
                        title: rotation,
                        className: `${CONTROL_NAME}-rotation-${rotation}`,
                        innerHTML: rotation,
                        fn: () => {
                            map.fire(event_1.IIIF_EVENTS.CHANGE_ROTATION, { value: Number.parseInt(rotation) });
                        },
                    };
                }));
            }
            if (this.options.mirroring.enabled === true && this.layer.server.mirroring === true) {
                this.createButton(container, this.options.mirroring.title, `${CONTROL_NAME}-mirroring`, this.options.mirroring.html, () => {
                    map.fire(event_1.IIIF_EVENTS.CHANGE_MIRRORING, { value: !this.layer.options.mirroring });
                });
            }
        });
        return container;
    }
    createActions(container, title, className, innerHTML, actions) {
        const actionsWrapper = leaflet_1.default.DomUtil.create("div", className);
        this.createButton(actionsWrapper, title, className, innerHTML, () => {
            if (container.dataset.opened === className)
                container.dataset.opened = "";
            else
                container.dataset.opened = className;
        });
        const actionsList = leaflet_1.default.DomUtil.create("ul", className);
        actions.forEach(action => {
            const li = leaflet_1.default.DomUtil.create("li", "", actionsList);
            this.createButton(li, action.title, action.className, action.innerHTML, () => {
                action.fn();
                container.dataset.opened = "";
            });
            actionsList.appendChild(li);
        });
        actionsWrapper.appendChild(actionsList);
        container.appendChild(actionsWrapper);
    }
    createButton(container, title, className, innerHTML, fn) {
        const link = leaflet_1.default.DomUtil.create("a", className, container);
        link.title = title;
        link.innerHTML = innerHTML;
        leaflet_1.default.DomEvent.on(link, "mousedown dblclick", leaflet_1.default.DomEvent.stopPropagation).on(link, "click", fn, this);
        return link;
    }
}
exports.IIIFControl = IIIFControl;
//# sourceMappingURL=toolbar.js.map