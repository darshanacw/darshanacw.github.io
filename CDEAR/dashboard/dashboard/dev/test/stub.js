// Minimal DOM + Leaflet + fetch stand-ins so the REAL dashboard script (src/app.js) can run in Node.
// Canvas = skia-canvas (real 2D drawing) -> charts and the grid layer can be saved as PNG and inspected.
const fs = require('fs'), path = require('path');
const { Canvas } = require('/opt/oai-docgen/node_modules/skia-canvas');
const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'src', 'template.html'), 'utf8');

const elements = {};
function mkEl(tag, id) {
  const el = { tagName: (tag || 'div').toUpperCase(), id: id || '', _h: {}, _children: [], style: {}, hidden: false, className: '', value: '', checked: true,
    _attrs: {}, _html: '', textContent: '', clientWidth: 0, clientHeight: 0 };
  el.addEventListener = (ev, fn) => { (el._h[ev] = el._h[ev] || []).push(fn); };
  el.getAttribute = (k) => (k in el._attrs ? el._attrs[k] : null);
  el.setAttribute = (k, v) => { el._attrs[k] = v; };
  el.appendChild = (c) => { el._children.push(c); return c; };
  el.remove = () => {}; el.click = () => {};
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: el.clientWidth, height: el.clientHeight });
  Object.defineProperty(el, 'innerHTML', { get: () => el._html, set: (v) => { el._html = v; } });
  Object.defineProperty(el, 'children', { get: () => el._children });
  el.closest = (s) => (s === 'button' && el.tagName === 'BUTTON' ? el : null);
  return el;
}
function canvasEl(id, w, h) {
  const c = new Canvas(w || 300, h || 150); const el = mkEl('canvas', id);
  return new Proxy(c, { get(t, k) { if (k in el && !(k in t)) return el[k]; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; }, set(t, k, v) { if (k in t) { t[k] = v; return true; } el[k] = v; return true; } });
}
// build one element per id found in the template; segmented-button containers get their <button> children parsed
const ids = [...TEMPLATE.matchAll(/id="([A-Za-z0-9_]+)"/g)].map((m) => m[1]);
ids.forEach((id) => { elements[id] = id === 'chart' ? canvasEl(id, 480, 250) : mkEl('div', id); });
elements.chart.clientWidth = 480; elements.chart.clientHeight = 250;
['mapMode', 'fCrop', 'tabs', 'tf', 'mm'].forEach((id) => {
  const re = new RegExp('id="' + id + '"[^>]*>([\\s\\S]*?)</div>'); const inner = TEMPLATE.match(re)[1];
  [...inner.matchAll(/<button([^>]*)>/g)].forEach((m) => {
    const b = mkEl('button'); [...m[1].matchAll(/(data-[a-z]+)="([^"]*)"/g)].forEach((a) => (b._attrs[a[1]] = a[2]));
    b.className = /class="on"/.test(m[1]) ? 'on' : ''; elements[id]._children.push(b);
  });
});
elements.map.clientWidth = 800; elements.map.clientHeight = 600;
elements.smooth.checked = true;

// ---------------- document / window
global.window = global; global.devicePixelRatio = 1;
global.document = {
  querySelector: (s) => (s[0] === '#' ? elements[s.slice(1)] || null : null),
  createElement: (t) => (t === 'canvas' ? canvasEl('', 300, 150) : mkEl(t)),
  body: mkEl('body'),
};
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); } };
global.location = { search: '', protocol: 'http:' };
const downloads = []; global.__downloads = downloads;
global.URL.createObjectURL = (b) => { downloads.push(b); return 'blob:x'; }; global.URL.revokeObjectURL = () => {};

// ---------------- fetch -> files of the fixture folder (404 for missing files, like a web server)
const ROOT = path.resolve(process.env.DATA_ROOT || path.join(__dirname, '..', 'fixture', 'data'));
global.__fetched = [];
global.fetch = (url) => {
  const p = path.join(ROOT, url.replace(/^dashboard\//, '')); global.__fetched.push(url);
  return new Promise((res) => fs.readFile(p, (e, b) => {
    if (e) return res({ ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0) });
    res({ ok: true, status: 200, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) });
  }));
};

// ---------------- Leaflet stand-in (linear lat/lng -> pixel mapping for the current view box)
const views = { w: -30, s: -40, e: 70, n: 45 };
const mapEvents = {}; global.__map = { events: mapEvents, view: views, layers: [], calls: [] };
function layer() { const l = { addTo(m) { global.__map.layers.push(l); return l; }, _h: {} }; return l; }
function geoLayer(json, opt) {
  const feats = (json.features || []).filter((f) => !opt.filter || opt.filter(f));
  const l = layer(); l.feats = feats; l.layers = feats.map((f) => {
    const lay = { feature: f, _h: {}, bringToFront() {}, bindTooltip(fn) { lay._tip = fn; return lay; }, on(ev, fn) { lay._h[ev] = fn; return lay; }, setStyle() {} };
    if (opt.onEachFeature) opt.onEachFeature(f, lay); return lay;
  });
  l.opt = opt; l.styles = feats.map((f) => opt.style(f)); l.eachLayer = (fn) => l.layers.forEach(fn); l.setStyle = (fn) => { l.styles = feats.map((f) => (typeof fn === 'function' ? fn(f) : fn)); };
  return l;
}
global.L = {
  map: () => {
    const m = {
      setView(c, z) { return m; }, createPane: (n) => { const p = mkEl('div'); m._panes = m._panes || {}; m._panes[n] = p; return p; }, getPane: (n) => m._panes[n],
      on(t, fn) { t.split(' ').forEach((k) => { (mapEvents[k] = mapEvents[k] || []).push(fn); }); return m; },
      getSize: () => ({ x: 800, y: 600 }), containerPointToLayerPoint: (p) => ({ x: p[0], y: p[1] }),
      latLngToContainerPoint: (ll) => ({ x: (ll[1] - views.w) / (views.e - views.w) * 800, y: (views.n - ll[0]) / (views.n - views.s) * 600 }),
      fitBounds(b) { views.s = b[0][0]; views.w = b[0][1]; views.n = b[1][0]; views.e = b[1][1]; const padx = (views.e - views.w) * 0.02, pady = (views.n - views.s) * 0.02; views.w -= padx; views.e += padx; views.s -= pady; views.n += pady; (mapEvents.move || []).forEach((f) => f()); global.__map.calls.push('fitBounds'); },
      invalidateSize() { return m; },
      removeLayer(l) { global.__map.layers = global.__map.layers.filter((x) => x !== l); },
    };
    global.__map.map = m; return m;
  },
  tileLayer: () => layer(), layerGroup: () => layer(), geoJSON: (j, o) => geoLayer(j, o),
  DomUtil: { setPosition(el, p) { el._pos = p; } },
};
module.exports = { elements, downloads, views, mapEvents, ROOT };
