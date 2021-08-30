function main(data) {
  importScripts(data.scriptUrl);
  let turfPolygons = data.turfPolygons;
  turfPolygons = turfPolygons.map((turfPolygon) => turf.polygon([turfPolygon]));
  dissolvedPolygons = turf.union(...turfPolygons);
  return dissolvedPolygons.geometry.coordinates;
};
