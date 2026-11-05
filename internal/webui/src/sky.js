// Draws a polar sky plot as SVG: north up, east right, horizon at the rim.
import { compassPoint } from './logic.js';

const NS = 'http://www.w3.org/2000/svg';
const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 92;

function make(name, attributes, parent) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  parent?.append(node);
  return node;
}

export function skyPoint(azimuth, elevation) {
  const distance = RADIUS * (90 - Math.max(0, Math.min(90, elevation))) / 90;
  const angle = azimuth * Math.PI / 180;
  return [CENTER + distance * Math.sin(angle), CENTER - distance * Math.cos(angle)];
}

export function renderSky(container, points, color, highlight) {
  container.replaceChildren();
  const svg = make('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'sky-plot', role: 'img' }, container);
  const above = points.filter((point) => point.elevation_deg >= 0);
  const peak = above.reduce((best, point) => (!best || point.elevation_deg > best.elevation_deg ? point : best), null);
  make('title', {}, svg).textContent = peak
    ? `Sky path peaking at ${Math.round(peak.elevation_deg)} degrees in the ${compassPoint(peak.azimuth_deg)}`
    : 'Sky plot';
  for (const elevation of [0, 30, 60]) {
    make('circle', { cx: CENTER, cy: CENTER, r: RADIUS * (90 - elevation) / 90, class: elevation === 0 ? 'sky-horizon' : 'sky-ring' }, svg);
  }
  make('line', { x1: CENTER, y1: CENTER - RADIUS, x2: CENTER, y2: CENTER + RADIUS, class: 'sky-ring' }, svg);
  make('line', { x1: CENTER - RADIUS, y1: CENTER, x2: CENTER + RADIUS, y2: CENTER, class: 'sky-ring' }, svg);
  for (const [label, x, y] of [['N', CENTER, 12], ['E', SIZE - 8, CENTER + 4], ['S', CENTER, SIZE - 4], ['W', 8, CENTER + 4]]) {
    make('text', { x, y, class: 'sky-label' }, svg).textContent = label;
  }
  for (const [elevation, label] of [[30, '30°'], [60, '60°']]) {
    make('text', { x: CENTER + 3, y: CENTER - RADIUS * (90 - elevation) / 90 - 2, class: 'sky-scale' }, svg).textContent = label;
  }
  if (!above.length) return;
  const path = above.map((point) => skyPoint(point.azimuth_deg, point.elevation_deg).map((value) => value.toFixed(1)).join(',')).join(' ');
  make('polyline', { points: path, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  if (highlight) {
    const stretch = above.filter((point) => {
      const at = Date.parse(point.at);
      return at >= Date.parse(highlight.start.at) && at <= Date.parse(highlight.end.at);
    });
    if (stretch.length > 1) {
      make('polyline', { points: stretch.map((point) => skyPoint(point.azimuth_deg, point.elevation_deg).map((value) => value.toFixed(1)).join(',')).join(' '), fill: 'none', class: 'sky-visible' }, svg);
    }
  }
  const dot = (point, radius, className) => {
    const [cx, cy] = skyPoint(point.azimuth_deg, point.elevation_deg);
    make('circle', { cx, cy, r: radius, class: className, fill: color }, svg);
  };
  dot(above[0], 3, 'sky-start');
  dot(peak, 4.5, 'sky-peak');
}
