"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateUrl = void 0;
function templateUrl(url) {
    return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}
exports.templateUrl = templateUrl;
//# sourceMappingURL=helper.js.map