/**
 * Generuje src/data/landDots.json — siatkę punktów [lat, lng] leżących na lądzie.
 * Źródło: world-atlas land-110m (Natural Earth). Uruchamiane raz, offline:
 *   node scripts/generate-land-dots.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const topo = JSON.parse(
  readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)),
);
const land = feature(topo, topo.objects.land); // FeatureCollection/Feature MultiPolygon

// ray-casting point-in-ring
function inRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(lng, lat, polygon) {
  // polygon = [outerRing, ...holes]
  if (!inRing(lng, lat, polygon[0])) return false;
  for (let h = 1; h < polygon.length; h++) {
    if (inRing(lng, lat, polygon[h])) return false;
  }
  return true;
}

const geoms =
  land.type === 'FeatureCollection' ? land.features.map((f) => f.geometry) : [land.geometry];

function onLand(lng, lat) {
  for (const g of geoms) {
    if (g.type === 'Polygon') {
      if (inPolygon(lng, lat, g.coordinates)) return true;
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) if (inPolygon(lng, lat, poly)) return true;
    }
  }
  return false;
}

// Siatka: gęstość długości geograficznej korygowana cos(lat), by kropki były
// równomierne na sferze (bez zagęszczenia przy biegunach).
const LAT_STEP = 1.4;
const dots = [];
for (let lat = -58; lat <= 84; lat += LAT_STEP) {
  const cos = Math.max(0.12, Math.cos((lat * Math.PI) / 180));
  const lngStep = LAT_STEP / cos;
  for (let lng = -180; lng < 180; lng += lngStep) {
    if (onLand(lng, lat)) dots.push([+lat.toFixed(2), +lng.toFixed(2)]);
  }
}

writeFileSync(
  new URL('../src/data/landDots.json', import.meta.url),
  JSON.stringify(dots),
);
console.log(`landDots.json: ${dots.length} punktów`);
