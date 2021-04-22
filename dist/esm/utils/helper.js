/**
 * Construct the tiles url template from the iiif image url
 */
export function templateUrl(url) {
    return url.replace(/info.json$/, "{region}/{size}/{mirroring}{rotation}/{quality}.{format}");
}
//# sourceMappingURL=helper.js.map