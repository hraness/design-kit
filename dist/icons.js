import"./chunk-5gtx3pza.js";

// src/icons.generated.ts
var hranessIconAssets = {};

// src/icons.ts
var hranessIcons = Object.keys(hranessIconAssets).sort().map((id) => ({
  ...hranessIconAssets[id],
  id
}));
function hranessIcon(id) {
  const asset = hranessIconAssets[id];
  return {
    ...asset,
    id
  };
}
function hranessIconsForSet(set) {
  return hranessIcons.filter((icon) => icon.set === set);
}
function hranessIconMarkup(id) {
  const icon = hranessIcon(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" role="img">${icon.body}</svg>`;
}
function hranessIconDataUri(id) {
  return `data:image/svg+xml,${encodeURIComponent(hranessIconMarkup(id))}`;
}
function hranessIconPath(id) {
  return `icons/${hranessIcon(id).file}`;
}
export {
  hranessIconsForSet,
  hranessIcons,
  hranessIconPath,
  hranessIconMarkup,
  hranessIconDataUri,
  hranessIcon
};
