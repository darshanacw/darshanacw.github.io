/* =============================================================================
   CDEAR v24 - dashboard on the pre-computed data written by the R scripts D01-D05.
   Data folder (default "dashboard/", or  ?data=path/to/folder ) :
     manifest.json, units/*.json, bnd/*, grid/*, ts/*, risk/*        (see README_dashboard_data.md)
   All risk classes are computed here from integer data, so the thresholds t1..t5 can be changed live.
   ============================================================================= */
(function () {
'use strict';
var $ = function (s) { return document.querySelector(s); };
var isN = function (x) { return x !== null && x !== undefined && x === x; };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var fmt = function (x, d) { return !isN(x) ? '–' : Number(x).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
var sgn = function (x, d) { if (!isN(x)) return '–'; d = d || 0; var r = Number(x.toFixed(d)); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r).toFixed(d); };
var pc = function (x, d) { return !isN(x) ? '–' : x.toFixed(d == null ? (x > 0 && x < 10 ? 1 : 0) : d) + '%'; };
function fmtHa(a) {
  if (!isN(a)) return '–';
  if (a >= 1e6) return (a / 1e6).toFixed(a >= 1e7 ? 1 : 2) + ' Mha';
  if (a >= 1e3) return fmt(Math.round(a / 1e3)) + ' kha';
  return fmt(Math.round(a)) + ' ha';
}
function mean(ts, crop, v, a, b) {                      // mean of an ANNUAL series over years a..b (ts from D.series)
  if (!ts) return null; var s = 0, n = 0;
  for (var y = a; y <= b; y++) { var t = y - ts.y0; if (t < 0 || t >= ts.nt) continue; var x = ts.at(crop, v, t); if (x !== null) { s += x; n++; } }
  return n ? s / n : null;
}
function monthMean(ts, crop, v, a, b, m) {              // mean of a MONTHLY series for calendar month m (0-11) over years a..b
  if (!ts) return null; var s = 0, n = 0, ny = ts.nt / 12;
  for (var y = a; y <= b; y++) { var k = y - ts.y0; if (k < 0 || k >= ny) continue; var x = ts.at(crop, v, k * 12 + m); if (x !== null) { s += x; n++; } }
  return n ? s / n : null;
}

/* ------------------------------------------------------------------ constants */
var SCN_LABEL = { ssp126: 'SSP1-2.6', ssp245: 'SSP2-4.5', ssp370: 'SSP3-7.0', ssp585: 'SSP5-8.5' };
var LV_LABEL = { continent: 'Africa', country: 'Countries', basin: 'Basins', subbasin: 'Sub-basins', adm1: 'Admin 1', adm2: 'Admin 2', adm3: 'Admin 3', cbasin: 'Basins', csubbasin: 'Sub-basins' };
var LV_ONE = { country: 'Country', basin: 'Basin', subbasin: 'Sub-basin', adm1: 'Admin 1', adm2: 'Admin 2', adm3: 'Admin 3', cbasin: 'Basin', csubbasin: 'Sub-basin' };
var COL = ['#2e9e5b', '#f2c94c', '#f2994a', '#e0463f', '#8e1b2f'], NDCOL = '#8a97a6';
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
var RGB = COL.map(hex), NDRGB = hex(NDCOL);
var VARS = [{ k: 'P', short: 'Rain', color: '#2F80ED' }, { k: 'PET', short: 'PET', color: '#F2994A' }, { k: 'AET', short: 'AET', color: '#EB5757' },
            { k: 'GET', short: 'Green', color: '#27AE60' }, { k: 'BET', short: 'Blue', color: '#00A8C6' }];
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var METRICS = [
  { k: 'risk_mod', name: 'Crop area at risk (≥ Moderate)', kind: 'risk' },
  { k: 'risk_any', name: 'Crop area at any risk (≥ Low)', kind: 'risk' },
  { k: 'risk_high', name: 'Crop area at High risk', kind: 'risk' },
  { k: 'dP', name: 'Rainfall change (%)', kind: 'pct', v: 0, bad: -1 },
  { k: 'dPET', name: 'PET change (%)', kind: 'pct', v: 1, bad: 1 },
  { k: 'dGET', name: 'Green ET change (mm/yr)', kind: 'mm', v: 3, bad: -1 },
  { k: 'dBET', name: 'Blue ET change (mm/yr)', kind: 'mm', v: 4, bad: 1 }];
var RISK_STOPS = ['#fff4cc', '#fed976', '#fd8d3c', '#e0463f', '#8e1b2f'];
var DIV_STOPS = ['#1d6fb8', '#8fc1e8', '#f1f1ee', '#f5a07a', '#c92a2a'];   // good ... bad
var BASE_LAYERS = {};

/* ------------------------------------------------------------------ state */
var D, M, map, UJ = {}, rid = 0, S = null, F = null, gridKey = '', goff = null, gbox = null, gcv = null, bLayer = null, bKey = '';
var bndCache = {}, lvlCache = {};
var st = { scn: null, gcm: null, pd: 1, crop: 0, region: 'AF', level: 'country', unit: null, mode: 'units', metric: 'risk_mod', tab: 'trend',
           tf: 'a', mm: 'cycle', vars: { P: 1, PET: 1, AET: 1, GET: 1, BET: 1 }, smooth: true, hide: {}, thr: null, sortKey: 'mod', sortDir: -1 };
var VN = ['Rainfall', 'PET', 'AET (required)', 'Green ET (available)', 'Blue ET (required)'];

/* ------------------------------------------------------------------ unit helpers */
function lvl(g, l) { return UJ[g] && UJ[g].levels ? UJ[g].levels[l] : null; }
function ctry(iso) { for (var i = 0; i < M.countries.length; i++) if (M.countries[i].iso3 === iso) return M.countries[i]; return null; }
function tagF() { return st.scn + '_' + st.gcm; }
function cropName(c) { return c === 0 ? 'Rainfed' : 'Irrigated'; }
function areaOf(g, l, i, crop) { var L = lvl(g, l); return L ? ((crop ? L.ir[i] : L.rf[i]) || 0) : 0; }
function target() {
  if (st.region === 'AF') return st.unit === null ? { g: 'AF', l: 'continent', i: 0 } : { g: 'AF', l: st.level, i: st.unit };
  if (st.unit === null) return { g: 'AF', l: 'country', i: ctry(st.region).idx };
  return { g: st.region, l: st.level, i: st.unit };
}
function nameOf(g, l, i) { var L = lvl(g, l); return L && L.name[i] !== undefined && L.name[i] !== null ? String(L.name[i]) : (LV_ONE[l] || l) + ' ' + i; }
function targetName() {
  var T = target();
  if (T.l === 'continent') return M.countries.length === 1 ? 'All loaded countries' : 'Africa';
  return nameOf(T.g, T.l, T.i);
}
function levelsFor(r) {
  if (r === 'AF') return ['country', 'basin', 'subbasin'].filter(function (l) { return lvl('AF', l); });
  var c = ctry(r), ls = (c && c.levels) || []; return ls.filter(function (l) { return lvl(r, l); });
}
function thrKey() { return JSON.stringify(st.thr); }
function eff() { return CDEARData.effectiveThresholds(st.thr, M); }

/* ------------------------------------------------------------------ data access */
function seriesBoth(T, freq) {
  return Promise.all([D.series('hist', T.g, T.l, T.i, freq), D.series(tagF(), T.g, T.l, T.i, freq)]).then(function (r) { return { h: r[0], f: r[1] }; });
}
function riskSum(rec, p, crop) {
  if (!rec) return null;
  var r = CDEARData.riskAreas(rec, p, crop, st.thr, M), t = r.total;
  var sh = [r.c0, r.c1, r.c2, r.c3, r.c4].map(function (a) { return t > 0 ? 100 * a / t : 0; });
  return { r: r, tot: t, sh: sh, any: t > 0 ? 100 * (r.c1 + r.c2 + r.c3 + r.c4) / t : NaN, mod: t > 0 ? 100 * (r.c2 + r.c3 + r.c4) / t : NaN, high: t > 0 ? 100 * (r.c3 + r.c4) / t : NaN };
}
function loadLevel(g, l, withSeries) {                // all units of a level: risk histograms (+ annual series)
  var key = [tagF(), g, l, withSeries ? 's' : 'r'].join('|');
  if (lvlCache[key]) return lvlCache[key];
  var L = lvl(g, l), n = L.n, ids = [], i;
  for (i = 0; i < n; i++) ids.push(i);
  var pr = Promise.all(ids.map(function (u) { return L.cells[u] > 0 ? D.risk(tagF(), g, l, u) : null; })).then(function (rk) {
    if (!withSeries) return { risk: rk };
    return Promise.all([Promise.all(ids.map(function (u) { return L.cells[u] > 0 ? D.series('hist', g, l, u, 'annual') : null; })),
                        Promise.all(ids.map(function (u) { return L.cells[u] > 0 ? D.series(tagF(), g, l, u, 'annual') : null; }))])
      .then(function (s) { return { risk: rk, sh: s[0], sf: s[1] }; });
  });
  lvlCache[key] = pr; return pr;
}
function ensureGrid() {
  var key = st.region + '|' + tagF();
  if (gridKey === key) return Promise.resolve();
  return Promise.all([D.gridStatic(st.region), D.gridFuture(st.region, tagF())]).then(function (r) {
    S = r[0]; F = r[1]; gridKey = key; if (S && !S._bb) S._bb = gridBB(S);
  });
}
function gridBB(s) {
  var nc = M.grid.ncol, c0 = 1e9, r0 = 1e9, c1 = -1, r1 = -1, a = s.a.cell0;
  for (var i = 0; i < a.length; i++) { var c = a[i] % nc, r = (a[i] / nc) | 0; if (c < c0) c0 = c; if (c > c1) c1 = c; if (r < r0) r0 = r; if (r > r1) r1 = r; }
  return { c0: c0, r0: r0, c1: c1 + 1, r1: r1 + 1 };
}
function boundary(g, l) {
  var key = g + '|' + l;
  if (bndCache[key] !== undefined) return Promise.resolve(bndCache[key]);
  return D.boundary(g, l).then(function (j) { bndCache[key] = j; return j; });
}

/* ------------------------------------------------------------------ colours */
function lerpHex(stops, t) {
  t = Math.max(0, Math.min(1, t)) * (stops.length - 1); var i = Math.min(stops.length - 2, Math.floor(t)), f = t - i, a = hex(stops[i]), b = hex(stops[i + 1]);
  return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }).join(',') + ')';
}
function gradCss(stops) { return 'linear-gradient(90deg,' + stops.join(',') + ')'; }
function niceMax(x) { if (!(x > 0)) return 10; var p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
function metricDef() { for (var i = 0; i < METRICS.length; i++) if (METRICS[i].k === st.metric) return METRICS[i]; return METRICS[0]; }
function metricVals(ctx, L) {                          // value of the map metric for every unit of the level (NaN = none)
  var md = metricDef(), n = L.n, out = new Float64Array(n), per = M.periods[st.pd], i;
  for (i = 0; i < n; i++) {
    var v = NaN;
    if (L.cells[i] > 0 && areaOf(st.region === 'AF' ? 'AF' : st.region, st.level, i, st.crop) > 0) {
      if (md.kind === 'risk') {
        var s = riskSum(ctx.risk[i], st.pd, st.crop);
        if (s && s.tot > 0) v = md.k === 'risk_mod' ? s.mod : md.k === 'risk_any' ? s.any : s.high;
      } else {
        var b = mean(ctx.sh[i], st.crop, md.v, M.hist.y0, M.hist.y1), f = mean(ctx.sf[i], st.crop, md.v, per[0], per[1]);
        if (b !== null && f !== null) v = md.kind === 'pct' ? (b > 0 ? 100 * (f - b) / b : NaN) : f - b;
      }
    }
    out[i] = v;
  }
  return out;
}
function scaleFor(vals) {
  var md = metricDef(), a = [], i; for (i = 0; i < vals.length; i++) if (vals[i] === vals[i]) a.push(vals[i]);
  a.sort(function (x, y) { return x - y; });
  if (md.kind === 'risk') return { lo: 0, hi: niceMax(a.length ? a[a.length - 1] : 10) };
  var m = a.length ? Math.max(Math.abs(a[Math.floor(a.length * 0.03)]), Math.abs(a[Math.min(a.length - 1, Math.floor(a.length * 0.97))])) : 1;
  m = niceMax(m || 1); return { lo: -m, hi: m };
}
function colorFor(v, sc) {
  if (!(v === v)) return NDCOL;
  var md = metricDef();
  if (md.kind === 'risk') return lerpHex(RISK_STOPS, (v - sc.lo) / (sc.hi - sc.lo || 1));
  var t = (v - sc.lo) / (sc.hi - sc.lo || 1);            // 0..1 from -m..+m
  if (md.bad < 0) t = 1 - t;                             // decrease is bad -> red end
  return lerpHex(DIV_STOPS, t);
}

/* ------------------------------------------------------------------ class descriptions */
function classInfo() {
  var e = eff();
  if (st.crop === 0) return [
    { n: 'No risk', d: 'Green ET ≥ baseline: can stay rainfed' },
    { n: 'Low', d: 'Green ET falls, blue ET need < ' + e.t1 + ' mm' },
    { n: 'Moderate', d: 'Green ET falls, blue ET need ' + e.t1 + '–' + e.t2 + ' mm' },
    { n: 'High', d: 'Green ET falls, blue ET need ' + e.t2 + '–' + e.t3 + ' mm' },
    { n: 'Very high', d: 'Green ET falls, blue ET need ≥ ' + e.t3 + ' mm' }];
  return [
    { n: 'No risk', d: 'Blue ET need ≤ baseline' },
    { n: 'Low', d: 'Blue ET need up, ratio < ' + e.t4.toFixed(2) },
    { n: 'Moderate', d: 'Ratio ' + e.t4.toFixed(2) + '–' + e.t5.toFixed(2) },
    { n: 'High', d: 'Ratio ≥ ' + e.t5.toFixed(2) + ' (or up from zero)' }];
}

/* ================================================================== MAP */
function initMap() {
  map = L.map('map', { zoomControl: true, preferCanvas: true, zoomAnimation: false, zoomSnap: 0.25 }).setView([5, 20], 4);
  map.createPane('labels'); var lp = map.getPane('labels'); lp.style.zIndex = 650; lp.style.pointerEvents = 'none';
  var ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  var TL = function (u, o) { return L.tileLayer(u, Object.assign({ maxZoom: 19 }, o)); };
  BASE_LAYERS = {
    sat: L.layerGroup([TL(ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 17, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' }),
                       TL(ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 17, pane: 'labels' })]),
    light: L.layerGroup([TL(ESRI + 'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, attribution: '© Esri, HERE, Garmin, OpenStreetMap contributors' }),
                         TL(ESRI + 'Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, pane: 'labels' })]),
    osm: L.layerGroup([TL('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' })])
  };
  BASE_LAYERS.cur = BASE_LAYERS.sat; BASE_LAYERS.cur.addTo(map);
  map.createPane('grid'); var gp = map.getPane('grid'); gp.style.zIndex = 350; gp.style.pointerEvents = 'none';
  gcv = document.createElement('canvas'); gcv.style.position = 'absolute'; gcv.style.left = '0'; gcv.style.top = '0'; gp.appendChild(gcv);
  map.on('move zoom viewreset resize', gridPlace);
  map.on('mousemove', onMapMove);
  map.on('mouseout', function () { if (st.mode === 'grid') showInfo(null); });
  map.on('click', onMapClick);
  gridPlace();
}
function gridPlace() {
  if (!gcv || !map) return;
  var s = map.getSize(); if (gcv.width !== s.x || gcv.height !== s.y) { gcv.width = s.x; gcv.height = s.y; }
  L.DomUtil.setPosition(gcv, map.containerPointToLayerPoint([0, 0])); gridDraw();
}
function gridDraw() {
  if (!gcv) return; var g = gcv.getContext('2d'); g.clearRect(0, 0, gcv.width, gcv.height);
  if (!goff || !gbox || st.mode !== 'grid') return;
  var a = map.latLngToContainerPoint([gbox[3], gbox[0]]), b = map.latLngToContainerPoint([gbox[1], gbox[2]]), w = b.x - a.x, h = b.y - a.y;
  if (!(w > 0 && h > 0)) return;
  g.imageSmoothingEnabled = w < goff.width; g.drawImage(goff, a.x, a.y, w, h);
}
function paintGrid(cls) {
  var bb = S._bb, w = bb.c1 - bb.c0, h = bb.r1 - bb.r0, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var g = cv.getContext('2d'), im = g.createImageData(w, h), d = im.data, a = S.a, crop = a.crop, c0 = a.cell0, nc = M.grid.ncol, n = S.hdr.n;
  var sel = st.unit, lv = a[st.level], i;
  for (i = 0; i < n; i++) {
    if (crop[i] !== st.crop) continue;
    var c = cls[i]; if (c >= 0 && st.hide[c]) continue;
    var x = c0[i] % nc - bb.c0, y = ((c0[i] / nc) | 0) - bb.r0, col = c < 0 ? NDRGB : RGB[c], o = (y * w + x) * 4;
    d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = (sel === null || (lv && lv[i] - 1 === sel)) ? 235 : 70;
  }
  g.putImageData(im, 0, 0); goff = cv; gbox = CDEARData.gridBox(bb.c0, bb.r0, bb.c1, bb.r1, M); gridDraw();
}
function fitBox(b) { if (b && map) map.fitBounds([[b[1], b[0]], [b[3], b[2]]], { padding: [12, 12] }); }
function fitRegion() {
  if (st.region === 'AF') {
    var c0 = 1e9, r0 = 1e9, c1 = -1, r1 = -1;
    M.countries.forEach(function (c) { if (c.bbox) { c0 = Math.min(c0, c.bbox[0]); r0 = Math.min(r0, c.bbox[1]); c1 = Math.max(c1, c.bbox[2]); r1 = Math.max(r1, c.bbox[3]); } });
    fitBox(c1 > 0 ? CDEARData.gridBox(c0, r0, c1, r1, M) : [-26, -35, 64, 38]);
  } else { var c = ctry(st.region); if (c && c.bbox) fitBox(CDEARData.gridBox(c.bbox[0], c.bbox[1], c.bbox[2], c.bbox[3], M)); }
}
function fitUnit() {
  var T = target(), L = lvl(T.g, T.l); if (!L || L.c0[T.i] === null || L.c0[T.i] === undefined) return;
  fitBox(CDEARData.gridBox(L.c0[T.i], L.r0[T.i], L.c1[T.i], L.r1[T.i], M));
}
function cellInfoHtml(i) {
  var a = S.a, p = 'p' + (st.pd + 1) + '_', c = a.crop[i], NA = CDEARData.NA16;
  var v = function (arr) { return arr[i] === NA ? '–' : fmt(arr[i]); };
  var e = eff(), k = c === 0 ? CDEARData.classRainfed(F.a[p + 'GET'][i], F.a[p + 'BET'][i], a.h_GET[i], e) : CDEARData.classIrrigated(F.a[p + 'BET'][i], a.h_BET[i], e);
  var ci = classInfo(), lab = k < 0 ? 'No data' : ci[k].n + ' risk';
  var arr = a[st.level], un = arr && arr[i] > 0 ? nameOf(st.region, st.level, arr[i] - 1) : '–';
  return '<b>' + cropName(c) + ' cell · ' + a.ha[i] + ' ha</b><br>' + esc(LV_ONE[st.level] || '') + ': ' + esc(un) + '<br>' +
    '<span class="dot" style="background:' + (k < 0 ? NDCOL : COL[k]) + '"></span><b>' + lab + '</b><br>' +
    'Green ET ' + v(a.h_GET) + ' → ' + v(F.a[p + 'GET']) + ' mm<br>Blue ET ' + v(a.h_BET) + ' → ' + v(F.a[p + 'BET']) + ' mm<br>Rain ' + v(a.h_P) + ' → ' + v(F.a[p + 'P']) + ' mm';
}
var infoDefault = '';
function showInfo(html) { var el = $('#mapInfo'); el.innerHTML = html || infoDefault; }
var hoverBusy = false;
function onMapMove(e) {
  if (st.mode !== 'grid' || !S || !F || hoverBusy) return; hoverBusy = true;
  var ll = e.latlng; requestAnimationFrame(function () {
    hoverBusy = false; var i = CDEARData.cellAt(S, ll.lng, ll.lat, M);
    showInfo(i >= 0 && S.a.crop[i] === st.crop ? cellInfoHtml(i) : null);
  });
}
function onMapClick(e) {
  if (st.mode !== 'grid' || !S) return;
  var i = CDEARData.cellAt(S, e.latlng.lng, e.latlng.lat, M); if (i < 0) return;
  var arr = S.a[st.level]; if (!arr || arr[i] < 1) return; selectUnit(arr[i] - 1, {});
}
function unitTip(g, l, i, vals, sc) {
  var a = areaOf(g, l, i, st.crop), v = vals ? vals[i] : NaN, md = metricDef();
  var vs = !(v === v) ? 'no data' : md.kind === 'risk' ? pc(v) : md.kind === 'pct' ? sgn(v, 1) + ' %' : sgn(v, 0) + ' mm';
  return '<b>' + esc(nameOf(g, l, i)) + '</b><br>' + cropName(st.crop) + ' area: ' + fmtHa(a) + '<br>' + esc(md.name) + ': <b>' + vs + '</b>';
}
function drawBoundary(j, g, l, mode, vals, sc) {
  if (bLayer) { map.removeLayer(bLayer); bLayer = null; }
  if (!j) return;
  var Lu = lvl(g, l), interactive = mode === 'units';
  var styleFn = function (f) {
    var i = f.properties.i, sel = st.unit === i;
    if (interactive) return { color: sel ? '#08425f' : '#ffffff', weight: sel ? 3 : 0.8, opacity: 1, fill: true, fillColor: colorFor(vals ? vals[i] : NaN, sc), fillOpacity: 0.82 };
    return { color: sel ? '#ffd23f' : '#16324f', weight: sel ? 3 : 1, opacity: sel ? 1 : 0.7, fill: false };
  };
  bLayer = L.geoJSON(j, {
    interactive: interactive, style: styleFn,
    filter: function (f) { return Lu && Lu.cells[f.properties.i] > 0; },
    onEachFeature: function (f, lay) {
      if (!interactive) return; var i = f.properties.i;
      lay.bindTooltip(function () { return unitTip(g, l, i, vals, sc); }, { sticky: true });
      lay.on('click', function () { selectUnit(i, {}); });
    }
  });
  bLayer.addTo(map);
  bLayer.eachLayer(function (lay) { if (lay.feature && lay.feature.properties.i === st.unit && lay.bringToFront) lay.bringToFront(); });
}

/* ================================================================== CHARTS */
function niceTicks(lo, hi, n) {
  var span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p, s = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p, t = [];
  for (var v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) t.push(+v.toFixed(10));
  return { ticks: t, step: s };
}
function setupCanvas(cv) {
  var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null;
  var d = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  var g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h); return { g: g, w: w, h: h };
}
function drawChart(cv, sp, hx) {
  var c = setupCanvas(cv); if (!c) return; var g = c.g, W = c.w, H = c.h, Lm = 42, Rm = 20, Tm = 8, Bm = 22, pw = W - Lm - Rm, ph = H - Tm - Bm;
  var mn = Infinity, mx = -Infinity;
  sp.lines.forEach(function (l) { l.pts.forEach(function (p) { if (isN(p[1])) { if (p[1] < mn) mn = p[1]; if (p[1] > mx) mx = p[1]; } }); });
  cv._pl = null;
  if (!isFinite(mn)) { g.fillStyle = '#8a97a6'; g.font = '12px Inter,Arial,sans-serif'; g.textAlign = 'center'; g.fillText(sp.empty || 'No data for this selection', W / 2, H / 2); return; }
  var y0 = Math.min(0, mn), y1 = Math.max(mx, y0 + 1), nt = niceTicks(y0, y1, 5);
  if (nt.ticks.length && nt.ticks[nt.ticks.length - 1] < y1) { nt.ticks.push(+(nt.ticks[nt.ticks.length - 1] + nt.step).toFixed(10)); }
  y1 = nt.ticks[nt.ticks.length - 1]; if (y0 < nt.ticks[0]) y0 = nt.ticks[0] - nt.step;
  var sx = function (x) { return Lm + (x - sp.x0) / (sp.x1 - sp.x0) * pw; }, sy = function (y) { return Tm + ph - (y - y0) / (y1 - y0) * ph; };
  if (sp.shade) { g.fillStyle = 'rgba(20,163,154,.10)'; g.fillRect(sx(sp.shade[0]), Tm, sx(sp.shade[1]) - sx(sp.shade[0]), ph); }
  g.font = '10px Inter,Arial,sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.lineWidth = 1;
  nt.ticks.forEach(function (t) { var y = sy(t); g.strokeStyle = t === 0 ? '#aab6c2' : '#e8eef3'; g.beginPath(); g.moveTo(Lm, y); g.lineTo(W - Rm, y); g.stroke(); g.fillStyle = '#6b7a8c'; g.fillText(fmt(t), Lm - 5, y); });
  g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = '#6b7a8c';
  sp.xticks.forEach(function (t) { var x = sx(t.x); g.strokeStyle = '#eef2f6'; g.beginPath(); g.moveTo(x, Tm); g.lineTo(x, Tm + ph); g.stroke(); g.fillText(t.l, x, Tm + ph + 5); });
  (sp.vmarks || []).forEach(function (x) { g.strokeStyle = '#9aa7b5'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(sx(x), Tm); g.lineTo(sx(x), Tm + ph); g.stroke(); g.setLineDash([]); });
  g.save(); g.beginPath(); g.rect(Lm, Tm - 2, pw, ph + 4); g.clip();
  sp.lines.forEach(function (l) {
    g.strokeStyle = l.color; g.lineWidth = l.w || 1.5; g.globalAlpha = l.a == null ? 1 : l.a; g.setLineDash(l.dash || []); g.lineJoin = 'round'; g.beginPath(); var pen = false;
    l.pts.forEach(function (p) { if (!isN(p[1])) { pen = false; return; } var x = sx(p[0]), y = sy(p[1]); if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y); });
    g.stroke();
  });
  g.restore(); g.globalAlpha = 1; g.setLineDash([]);
  if (hx != null) { var X = sx(hx); g.strokeStyle = '#1b2a3a'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Tm); g.lineTo(X, Tm + ph); g.stroke(); }
  cv._pl = { Lm: Lm, pw: pw, Tm: Tm, ph: ph, x0: sp.x0, x1: sp.x1 }; cv._sp = sp;
}
function wireChart() {
  var cv = $('#chart'), tip = $('#ctip');
  cv.addEventListener('mousemove', function (e) {
    var pl = cv._pl, sp = cv._sp; if (!pl || !sp || !sp.tip) return;
    var r = cv.getBoundingClientRect(), px = e.clientX - r.left, x = sp.x0 + (px - pl.Lm) / pl.pw * (sp.x1 - sp.x0);
    x = sp.snap(x); if (x === null || x < sp.x0 || x > sp.x1) { tip.style.display = 'none'; return; }
    drawChart(cv, sp, x); tip.innerHTML = sp.tip(x); tip.style.display = 'block';
    var left = px + 14; if (left + 190 > cv.clientWidth) left = px - 190; tip.style.left = Math.max(4, left) + 'px'; tip.style.top = '10px';
  });
  cv.addEventListener('mouseleave', function () { tip.style.display = 'none'; if (cv._sp) drawChart(cv, cv._sp, null); });
}
function onVars() { return VARS.map(function (v, i) { return { v: v, i: i }; }).filter(function (o) { return st.vars[o.v.k]; }); }
function movavg(pts, before, after) {                   // centred window of before + after + 1 points; needs more than half of them
  if (after === undefined) after = before;
  var need = Math.ceil((before + after + 1) / 2);
  return pts.map(function (p, i) {
    var s = 0, n = 0; for (var j = Math.max(0, i - before); j <= Math.min(pts.length - 1, i + after); j++) { if (isN(pts[j][1])) { s += pts[j][1]; n++; } }
    return [p[0], n >= need ? s / n : null];
  });
}
function annualSpec(A) {
  var per = M.periods[st.pd], lines = [], hv = {}, fv = {};
  onVars().forEach(function (o) {
    var hp = [], fp = [], t;
    if (A.h) for (t = 0; t < A.h.nt; t++) hp.push([A.h.y0 + t, A.h.at(st.crop, o.i, t)]);
    if (A.f) for (t = 0; t < A.f.nt; t++) fp.push([A.f.y0 + t, A.f.at(st.crop, o.i, t)]);
    hv[o.v.k] = {}; fv[o.v.k] = {}; hp.forEach(function (p) { hv[o.v.k][p[0]] = p[1]; }); fp.forEach(function (p) { fv[o.v.k][p[0]] = p[1]; });
    lines.push({ color: o.v.color, pts: fp, w: 1, a: st.smooth ? 0.4 : 0.9 });
    if (st.smooth) lines.push({ color: o.v.color, pts: movavg(fp, 5), w: 2.4 });
    lines.push({ color: '#1b2a3a', pts: hp, w: 2.6, a: 0.9 });
    lines.push({ color: o.v.color, pts: hp, w: 1.6 });
  });
  var x0 = M.hist.y0, x1 = Math.max(M.future.y1, M.hist.y1), xt = [];
  for (var y = 2020; y <= x1; y += 20) xt.push({ x: y, l: String(y) });
  xt.unshift({ x: x0, l: String(x0) });
  return { x0: x0, x1: x1, lines: lines, xticks: xt, shade: [per[0], per[1]], vmarks: [M.hist.y1 + 0.5],
    snap: function (x) { return Math.round(x); },
    tip: function (x) {
      var h = '<b>' + x + '</b>';
      onVars().forEach(function (o) {
        var a = hv[o.v.k][x], b = fv[o.v.k][x];
        h += '<br><span class="dot" style="background:' + o.v.color + '"></span>' + o.v.short + ': ' + (isN(a) ? 'baseline ' + fmt(a) : '') + (isN(a) && isN(b) ? ' · ' : '') + (isN(b) ? 'projection ' + fmt(b) : '') + (!isN(a) && !isN(b) ? '–' : '');
      });
      return h + '<br><i style="color:#8a97a6">mm/yr</i>';
    } };
}
function cycleSpec(Mo) {
  var per = M.periods[st.pd], lines = [], bv = {}, fv = {};
  onVars().forEach(function (o) {
    var bp = [], fp = [], m;
    for (m = 0; m < 12; m++) { bp.push([m + 1, monthMean(Mo.h, st.crop, o.i, M.hist.y0, M.hist.y1, m)]); fp.push([m + 1, monthMean(Mo.f, st.crop, o.i, per[0], per[1], m)]); }
    bv[o.v.k] = bp; fv[o.v.k] = fp;
    lines.push({ color: o.v.color, pts: bp, w: 1.6, dash: [4, 3], a: 0.9 }); lines.push({ color: o.v.color, pts: fp, w: 2.6 });
  });
  return { x0: 0.5, x1: 12.5, lines: lines, xticks: MONTHS.map(function (n, i) { return { x: i + 1, l: n }; }), snap: function (x) { var m = Math.round(x); return m >= 1 && m <= 12 ? m : null; },
    tip: function (m) {
      var h = '<b>' + MONTHS[m - 1] + '</b>';
      onVars().forEach(function (o) { h += '<br><span class="dot" style="background:' + o.v.color + '"></span>' + o.v.short + ': baseline ' + fmt(bv[o.v.k][m - 1][1]) + ' · ' + per[0] + '–' + per[1] + ' ' + fmt(fv[o.v.k][m - 1][1]); });
      return h + '<br><i style="color:#8a97a6">mm/month</i>';
    } };
}
function seriesSpec(Mo) {
  var per = M.periods[st.pd], lines = [], look = {};
  onVars().forEach(function (o) {
    var hp = [], fp = [], k, ny;
    if (Mo.h) { ny = Mo.h.nt / 12; for (k = 0; k < Mo.h.nt; k++) hp.push([Mo.h.y0 + (k + 0.5) / 12, Mo.h.at(st.crop, o.i, k)]); }
    if (Mo.f) for (k = 0; k < Mo.f.nt; k++) fp.push([Mo.f.y0 + (k + 0.5) / 12, Mo.f.at(st.crop, o.i, k)]);
    look[o.v.k] = { h: hp, f: fp };
    lines.push({ color: o.v.color, pts: fp, w: 0.8, a: st.smooth ? 0.35 : 0.9 }); lines.push({ color: o.v.color, pts: hp, w: 1.2 });
    if (st.smooth) lines.push({ color: o.v.color, pts: movavg(fp, 6, 5), w: 2.4 });
  });
  var x0 = M.hist.y0, x1 = M.future.y1 + 1, xt = [{ x: x0, l: String(x0) }]; for (var y = 2020; y <= M.future.y1; y += 20) xt.push({ x: y, l: String(y) });
  return { x0: x0, x1: x1, lines: lines, xticks: xt, shade: [per[0], per[1] + 1], vmarks: [M.hist.y1 + 1],
    snap: function (x) { var m = Math.floor(x * 12) / 12; return m + 1 / 24; },
    tip: function (x) {
      var y = Math.floor(x), m = Math.floor((x - y) * 12 + 1e-6), h = '<b>' + MONTHS[Math.min(11, Math.max(0, m))] + ' ' + y + '</b>';
      onVars().forEach(function (o) {
        var s = look[o.v.k], a = s.f.filter(function (p) { return Math.abs(p[0] - x) < 1e-6; })[0], b = s.h.filter(function (p) { return Math.abs(p[0] - x) < 1e-6; })[0];
        var vv = a && isN(a[1]) ? a[1] : (b && isN(b[1]) ? b[1] : null);
        h += '<br><span class="dot" style="background:' + o.v.color + '"></span>' + o.v.short + ': ' + (vv === null ? '–' : fmt(vv));
      });
      return h + '<br><i style="color:#8a97a6">mm/month</i>';
    } };
}

/* ================================================================== RENDERERS */
function setText(id, t) { $(id).textContent = t; }
function kpiRise(b, f, kind) {                           // delta text with colour: bad = red, good = blue
  if (!isN(b) || !isN(f)) return '';
  var d = f - b, p = b > 0 ? 100 * d / b : null;
  var up = d > 0, bad = kind === 'rain' || kind === 'green' ? d < 0 : d > 0, cls = Math.abs(d) < 0.5 ? '' : (bad ? 'up' : 'dn');
  return ' · <span class="' + cls + '">' + sgn(d, 0) + ' mm' + (p !== null ? ' (' + sgn(p, 0) + '%)' : '') + '</span>';
}
function renderKpis(T, A, rec) {
  var per = M.periods[st.pd], pl = per[0] + '–' + per[1], name = cropName(st.crop).toLowerCase();
  var ar = areaOf(T.g, T.l, T.i, st.crop), oth = areaOf(T.g, T.l, T.i, 1 - st.crop);
  setText('#k1l', cropName(st.crop) + ' crop area · ' + targetName());
  setText('#k1', fmtHa(ar)); $('#k1s').innerHTML = 'other type: ' + fmtHa(oth) + (ar + oth > 0 ? ' (' + pc(100 * oth / (ar + oth)) + ' of all cropland)' : '');
  var defs = [['#k2', 0, 'rain', 'Rainfall'], ['#k3', 3, 'green', 'Green ET (available)'], ['#k4', 4, 'blue', 'Blue ET (required)']];
  defs.forEach(function (d, j) {
    var b = A.h ? mean(A.h, st.crop, d[1], M.hist.y0, M.hist.y1) : null, f = A.f ? mean(A.f, st.crop, d[1], per[0], per[1]) : null;
    setText(d[0] + 'l', d[3] + ' · ' + pl + ' (mm/yr)'); setText(d[0], ar > 0 && f !== null ? fmt(f) : '–');
    $(d[0] + 's').innerHTML = ar > 0 ? 'baseline ' + fmt(b) + kpiRise(b, f, d[2]) : 'no ' + name + ' area';
  });
  var s = riskSum(rec, st.pd, st.crop);
  setText('#k5l', 'Crop area at risk (≥ Moderate) · ' + pl);
  if (s && s.tot > 0) { setText('#k5', pc(s.mod)); $('#k5s').textContent = 'High: ' + pc(s.high) + ' · any risk: ' + pc(s.any) + ' · ' + fmtHa(s.r.c2 + s.r.c3 + s.r.c4) + ' at Moderate+'; }
  else { setText('#k5', '–'); $('#k5s').textContent = ar > 0 ? 'no risk data for this unit' : 'no ' + name + ' area'; }
}
function renderLegend(rec) {
  var el = $('#legend');
  if (st.mode === 'grid') {
    var s = riskSum(rec, st.pd, st.crop), ci = classInfo(), h = '<div class="lgC">';
    ci.forEach(function (c, k) {
      var a = s ? [s.r.c0, s.r.c1, s.r.c2, s.r.c3, s.r.c4][k] : null;
      h += '<button class="lgItem' + (st.hide[k] ? ' off' : '') + '" data-k="' + k + '" style="--c:' + COL[k] + '" title="' + esc(c.d) + '"><span class="sw"></span><b>' + c.n + '</b><em>' + (a !== null ? fmtHa(a) + ' · ' + pc(s.tot > 0 ? 100 * a / s.tot : 0) : '') + '</em></button>';
    });
    if (s && s.r.nd > 0) h += '<div class="lgItem nd" style="--c:' + NDCOL + '"><span class="sw"></span><b>No data</b><em>' + fmtHa(s.r.nd) + '</em></div>';
    var e = eff(); h += '</div><div class="lgNote">Thresholds: t1 ' + e.t1 + ' · t2 ' + e.t2 + ' · t3 ' + e.t3 + ' mm · t4 ' + e.t4.toFixed(2) + ' · t5 ' + e.t5.toFixed(2) + ' · <a id="lgEdit">edit</a> · click a class to hide it · ' + cropName(st.crop).toLowerCase() + ' cells only</div>';
    el.innerHTML = h;
  } else {
    var sc = st._sc || { lo: 0, hi: 100 }, md = metricDef(), stops = md.kind === 'risk' ? RISK_STOPS : (md.bad < 0 ? DIV_STOPS.slice().reverse() : DIV_STOPS);
    var f2 = function (v) { return md.kind === 'risk' ? pc(v, 0) : md.kind === 'pct' ? sgn(v, 0) + ' %' : sgn(v, 0) + ' mm'; };
    el.innerHTML = '<div class="lgRow"><span>' + f2(sc.lo) + '</span><span>' + esc(md.name) + ' · ' + M.periods[st.pd][0] + '–' + M.periods[st.pd][1] + ' · ' + cropName(st.crop).toLowerCase() + '</span><span>' + f2(sc.hi) + '</span></div><div class="lgBar" style="background:' + gradCss(stops) + '"></div>' +
      '<div class="lgNote">Grey = no ' + cropName(st.crop).toLowerCase() + ' data · click a unit to select it' + (md.kind !== 'risk' ? ' · ' + (md.bad < 0 ? 'red = decrease' : 'red = increase') : '') + '</div>';
  }
}
function renderMapHead(T) {
  var per = M.periods[st.pd], pl = per[0] + '–' + per[1], rn = st.region === 'AF' ? 'Africa' : ctry(st.region).name;
  if (st.mode === 'grid') { setText('#mapTitle', 'Risk class of every 1-km ' + cropName(st.crop).toLowerCase() + ' crop cell · ' + rn); }
  else { setText('#mapTitle', metricDef().name + ' · ' + LV_LABEL[st.level].toLowerCase() + (st.region === 'AF' ? ' of ' + rn : ' of ' + rn)); }
  setText('#mapSub', pl + ' vs baseline ' + M.hist.y0 + '–' + M.hist.y1 + ' · ' + (SCN_LABEL[st.scn] || st.scn) + (M.gcms.length > 1 ? ' · ' + st.gcm : '') + ' · selected: ' + targetName());
  infoDefault = st.mode === 'grid' ? 'Hover a cell to inspect it · click to select its ' + (LV_ONE[st.level] || 'unit').toLowerCase() : 'Hover a unit · click to select';
  showInfo(null);
}
function renderTrend(A, Mo) {
  var tf = st.tf, spec, T = target(), ar = areaOf(T.g, T.l, T.i, st.crop);
  var chips = VARS.map(function (v, i) { return '<button class="vchip' + (st.vars[v.k] ? '' : ' off') + '" data-v="' + v.k + '" style="--c:' + v.color + '"><i></i>' + esc(VN[i]) + '</button>'; }).join('');
  $('#varChips').innerHTML = chips;
  $('#mm').style.display = tf === 'm' ? 'inline-flex' : 'none'; $('#smWrap').style.display = (tf === 'a' || (tf === 'm' && st.mm === 'series')) ? 'inline-flex' : 'none';
  var cv = $('#chart'), per = M.periods[st.pd], pl = per[0] + '–' + per[1];
  if (ar <= 0) { spec = { x0: 0, x1: 1, lines: [], xticks: [], empty: 'No ' + cropName(st.crop).toLowerCase() + ' area in this unit', snap: function () { return null; } }; }
  else if (tf === 'a') spec = annualSpec(A);
  else if (st.mm === 'cycle') spec = cycleSpec(Mo);
  else spec = seriesSpec(Mo);
  drawChart(cv, spec, null);
  $('#chartNote').innerHTML = tf === 'a' ? '<b>' + esc(targetName()) + ' · ' + cropName(st.crop).toLowerCase() + ' cropland.</b> Dark outline = baseline ' + M.hist.y0 + '–' + M.hist.y1 + ' (observation-based) · thin = annual projection · bold = 10-year mean · shaded = ' + pl + '. mm per year, crop-area weighted.'
    : st.mm === 'cycle' ? '<b>Mean seasonal cycle</b> (mm/month). Dashed = baseline ' + M.hist.y0 + '–' + M.hist.y1 + ' · solid = ' + pl + '.'
    : '<b>Monthly series</b> ' + M.hist.y0 + '–' + M.future.y1 + ' (mm/month). Thin = monthly values · bold = 12-month mean.';
  // summary table
  var h = '<tr><th>Annual, mm/yr</th><th>Baseline</th><th>' + pl + '</th><th>Change</th><th>Change %</th></tr>';
  VARS.forEach(function (v, i) {
    var b = A && A.h ? mean(A.h, st.crop, i, M.hist.y0, M.hist.y1) : null, f = A && A.f ? mean(A.f, st.crop, i, per[0], per[1]) : null, d = isN(b) && isN(f) ? f - b : null;
    h += '<tr><td><span class="dot" style="background:' + v.color + '"></span>' + esc(VN[i]) + '</td><td>' + fmt(b) + '</td><td>' + fmt(f) + '</td><td>' + sgn(d, 0) + '</td><td>' + (isN(d) && b > 0 ? sgn(100 * d / b, 1) + '%' : '–') + '</td></tr>';
  });
  $('#sumTbl').innerHTML = h;
}
function renderRisk(T, rec) {
  var e = eff(), ci = classInfo(), per = M.periods[st.pd];
  ['t1', 't2', 't3'].forEach(function (k) { $('#' + k).value = e[k]; }); ['t4', 't5'].forEach(function (k) { $('#' + k).value = e[k].toFixed(2); });
  var req = st.thr, snapped = Math.abs(req.t4 - e.t4) > 1e-9 || Math.abs(req.t5 - e.t5) > 1e-9 || req.t1 !== e.t1 || req.t2 !== e.t2 || req.t3 !== e.t3;
  $('#thrNote').textContent = snapped ? 'Values were adjusted to the data resolution (5 mm, 0.01) and to t1 ≤ t2 ≤ t3, t4 ≤ t5.' : '';
  if (!rec) { $('#riskBars').innerHTML = '<div class="msg">No risk data for ' + esc(targetName()) + ' (' + esc(tagF()) + ').</div>'; $('#riskTbl').innerHTML = ''; }
  else {
    var h = '<div class="note"><b>Crop area by risk class</b> · ' + esc(targetName()) + ' · ' + cropName(st.crop).toLowerCase() + ' · click a period</div>';
    M.periods.forEach(function (p, j) {
      var s = riskSum(rec, j, st.crop); if (!s || s.tot <= 0) { h += '<div class="rbar"><b>' + p[0] + '–' + p[1] + '</b><div class="rb"></div><em>–</em></div>'; return; }
      h += '<div class="rbar' + (j === st.pd ? ' on' : '') + '" data-p="' + j + '"><b>' + p[0] + '–' + p[1] + '</b><div class="rb">' + ci.map(function (c, k) { return '<span style="width:' + s.sh[k] + '%;background:' + COL[k] + '" title="' + c.n + ': ' + pc(s.sh[k]) + '"></span>'; }).join('') + '</div><em>' + pc(s.mod) + ' ≥ Mod.</em></div>';
    });
    $('#riskBars').innerHTML = h;
    var s0 = riskSum(rec, st.pd, st.crop), t = '<tr><th>Class · ' + per[0] + '–' + per[1] + '</th><th>Definition</th><th>Area</th><th>Share</th></tr>';
    if (s0) { var arr = [s0.r.c0, s0.r.c1, s0.r.c2, s0.r.c3, s0.r.c4];
      ci.forEach(function (c, k) { t += '<tr><td><span class="dot" style="background:' + COL[k] + '"></span>' + c.n + '</td><td style="text-align:left;white-space:normal">' + esc(c.d) + '</td><td>' + fmtHa(arr[k]) + '</td><td>' + pc(s0.tot > 0 ? 100 * arr[k] / s0.tot : 0, 1) + '</td></tr>'; });
      if (s0.r.nd > 0) t += '<tr><td><span class="dot" style="background:' + NDCOL + '"></span>No data</td><td style="text-align:left">cells without a value</td><td>' + fmtHa(s0.r.nd) + '</td><td></td></tr>'; }
    $('#riskTbl').innerHTML = t;
  }
  $('#riskDef').innerHTML = st.crop === 0 ? '<b>Rainfed cells.</b> Compared with the baseline ' + M.hist.y0 + '–' + M.hist.y1 + ': if green ET (available) does not fall the cell can stay rainfed. If it falls, the risk is set by the blue ET (required) in the future period: Low &lt; t1, Moderate &lt; t2, High &lt; t3, Very high ≥ t3.'
    : '<b>Irrigated cells.</b> If blue ET (required) does not exceed the baseline there is no risk. If it rises, the risk is set by the ratio future / baseline: Low &lt; t4, Moderate &lt; t5, High ≥ t5 (a rise from zero counts as High).';
}
function renderUnits(ctx, L) {
  var g = st.region === 'AF' ? 'AF' : st.region, vals = [], n = L.n, i;
  for (i = 0; i < n; i++) {
    var a = areaOf(g, st.level, i, st.crop); if (!(a > 0)) continue;
    var s = riskSum(ctx.risk[i], st.pd, st.crop); vals.push({ i: i, name: nameOf(g, st.level, i), a: a, s: s });
  }
  var key = st.sortKey, dir = st.sortDir, gv = function (o) { return key === 'name' ? o.name.toLowerCase() : key === 'a' ? o.a : !o.s || !(o.s.tot > 0) ? -1 : key === 'mod' ? o.s.mod : key === 'high' ? o.s.high : key === 'c0' ? o.s.sh[0] : key === 'c1' ? o.s.sh[1] : o.s.sh[2]; };
  vals.sort(function (x, y) { var a = gv(x), b = gv(y); return (a < b ? -1 : a > b ? 1 : 0) * dir; });
  st._rows = vals;
  var th = function (k, t) { return '<th class="srt" data-s="' + k + '">' + t + (st.sortKey === k ? (st.sortDir < 0 ? ' ▼' : ' ▲') : '') + '</th>'; };
  var h = '<tr>' + th('name', LV_ONE[st.level] || 'Unit') + th('a', 'Area') + th('c0', 'No risk') + th('c1', 'Low') + th('c2', 'Mod.') + th('high', 'High+') + th('mod', '≥ Mod.') + '</tr>';
  vals.slice(0, 400).forEach(function (o) {
    var s = o.s, ok = s && s.tot > 0;
    h += '<tr class="clk' + (st.unit === o.i ? ' sel' : '') + '" data-u="' + o.i + '"><td class="nm" title="' + esc(o.name) + '">' + esc(o.name) + '</td><td>' + fmtHa(o.a) + '</td><td>' + (ok ? pc(s.sh[0]) : '–') + '</td><td>' + (ok ? pc(s.sh[1]) : '–') + '</td><td>' + (ok ? pc(s.sh[2]) : '–') + '</td><td>' + (ok ? pc(s.high) : '–') + '</td><td><b>' + (ok ? pc(s.mod) : '–') + '</b></td></tr>';
  });
  $('#uTbl').innerHTML = h;
  setText('#uCount', vals.length + ' ' + (LV_LABEL[st.level] || '').toLowerCase() + ' with ' + cropName(st.crop).toLowerCase() + ' area' + (vals.length > 400 ? ' · top 400 shown (CSV has all)' : '') + ' · ' + M.periods[st.pd][0] + '–' + M.periods[st.pd][1]);
}

/* ================================================================== CONTROLS */
function options(arr, cur) { return arr.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
function fillControls() {
  var regs = [['AF', 'Africa (all countries)']].concat(M.countries.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) { return [c.iso3, c.name]; }));
  $('#fRegion').innerHTML = options(regs, st.region);
  var lv = levelsFor(st.region); $('#fLevel').innerHTML = options(lv.map(function (l) { return [l, LV_LABEL[l]]; }), st.level);
  setText('#lbUnit', (LV_ONE[st.level] || 'Unit') + ' (optional)');
  var g = st.region === 'AF' ? 'AF' : st.region, L = lvl(g, st.level), us = [['', 'All ' + (st.region === 'AF' ? 'Africa' : ctry(st.region).name)]];
  if (L) { var arr = []; for (var i = 0; i < L.n; i++) if (areaOf(g, st.level, i, st.crop) > 0) arr.push([i, nameOf(g, st.level, i)]); arr.sort(function (a, b) { return a[1].localeCompare(b[1], undefined, { numeric: true }); }); us = us.concat(arr); }
  $('#fUnit').innerHTML = options(us, st.unit === null ? '' : st.unit);
  var scns = M.scenarios.filter(function (s) { return M.tags.some(function (t) { return t.indexOf(s + '_') === 0; }); });
  $('#fScn').innerHTML = options(scns.map(function (s) { return [s, SCN_LABEL[s] || s]; }), st.scn);
  $('#fGcm').innerHTML = options(M.gcms.map(function (g2) { return [g2, g2]; }), st.gcm); $('#fGcmBox').style.display = M.gcms.length > 1 ? '' : 'none';
  $('#fPer').innerHTML = options(M.periods.map(function (p, j) { return [j, p[0] + '–' + p[1]]; }), st.pd);
  $('#fMetric').innerHTML = options(METRICS.map(function (m) { return [m.k, m.name]; }), st.metric);
  $('#fMetric').style.display = st.mode === 'units' ? '' : 'none'; $('#mapMode').style.display = st.region === 'AF' ? 'none' : 'inline-flex';
  Array.prototype.forEach.call($('#mapMode').children, function (b) { b.className = b.getAttribute('data-m') === st.mode ? 'on' : ''; });
  Array.prototype.forEach.call($('#fCrop').children, function (b) { b.className = +b.getAttribute('data-c') === st.crop ? 'on' : ''; });
  Array.prototype.forEach.call($('#tabs').children, function (b) { b.className = b.getAttribute('data-t') === st.tab ? 'on' : ''; });
  Array.prototype.forEach.call($('#tf').children, function (b) { b.className = b.getAttribute('data-t') === st.tf ? 'on' : ''; });
  Array.prototype.forEach.call($('#mm').children, function (b) { b.className = b.getAttribute('data-m') === st.mm ? 'on' : ''; });
  ['pTrend', 'pRisk', 'pUnits'].forEach(function (id) { $('#' + id).hidden = !((id === 'pTrend' && st.tab === 'trend') || (id === 'pRisk' && st.tab === 'risk') || (id === 'pUnits' && st.tab === 'units')); });
  $('#chipBack').hidden = st.region === 'AF'; $('#chipClear').hidden = st.unit === null;
  var T = target(); var canOpen = st.region === 'AF' && st.level === 'country' && st.unit !== null;
  $('#chipOpen').hidden = !canOpen; if (canOpen) $('#chipOpen').textContent = 'Open ' + nameOf('AF', 'country', st.unit) + ' ›';
  setText('#scnTag', (SCN_LABEL[st.scn] || st.scn) + (M.gcms.length > 1 ? ' · ' + st.gcm : ' · ' + M.gcms[0])); setText('#baseTag', 'Baseline ' + M.hist.y0 + '–' + M.hist.y1);
}
function busy(on) { var b = $('#busy'); if (b) b.className = 'busy' + (on ? ' on' : ''); }
function selectUnit(i, o) { st.unit = i; if (o && o.zoom && i !== null) fitUnit(); update(); }
function goRegion(r) {
  return D.units(r).then(function (u) {
    if (!u) { fillControls(); setText('#mapSub', 'No dashboard data found for ' + r + ' (units/' + r + '.json is missing in the data folder)'); return null; }
    UJ[r] = u; st.region = r; st.unit = null; st.hide = {}; S = null; F = null; gridKey = '';
    var lv = levelsFor(r); st.level = lv.indexOf(st.level) >= 0 && r === 'AF' ? st.level : lv[0];
    st.mode = r === 'AF' ? 'units' : 'grid'; return update({ fit: 'region' });
  });
}
function wire() {
  var on = function (s, ev, fn) { $(s).addEventListener(ev, fn); };
  on('#fRegion', 'change', function (e) { goRegion(e.target.value); });
  on('#fLevel', 'change', function (e) { st.level = e.target.value; st.unit = null; st.hide = {}; update({ fit: 'region' }); });
  on('#fUnit', 'change', function (e) { var v = e.target.value; selectUnit(v === '' ? null : +v, { zoom: v !== '' }); });
  on('#fScn', 'change', function (e) { st.scn = e.target.value; update(); });
  on('#fGcm', 'change', function (e) { st.gcm = e.target.value; update(); });
  on('#fPer', 'change', function (e) { st.pd = +e.target.value; update(); });
  on('#fMetric', 'change', function (e) { st.metric = e.target.value; update(); });
  on('#fBase', 'change', function (e) { map.removeLayer(BASE_LAYERS.cur); BASE_LAYERS.cur = BASE_LAYERS[e.target.value]; BASE_LAYERS.cur.addTo(map); });
  on('#fCrop', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; st.crop = +b.getAttribute('data-c'); if (st.unit !== null && !(areaOf(target().g, st.level, st.unit, st.crop) > 0)) st.unit = null; update(); });
  on('#mapMode', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; st.mode = b.getAttribute('data-m'); update(); });
  on('#tabs', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; st.tab = b.getAttribute('data-t'); update(); });
  on('#tf', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; st.tf = b.getAttribute('data-t'); update(); });
  on('#mm', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; st.mm = b.getAttribute('data-m'); update(); });
  on('#smooth', 'change', function (e) { st.smooth = e.target.checked; update(); });
  on('#varChips', 'click', function (e) { var b = e.target.closest && e.target.closest('button'); if (!b) return; var k = b.getAttribute('data-v'); st.vars[k] = st.vars[k] ? 0 : 1; update(); });
  on('#legend', 'click', function (e) {
    if (e.target.id === 'lgEdit') { st.tab = 'risk'; update(); return; }
    var b = e.target.closest && e.target.closest('.lgItem'); if (!b || b.getAttribute('data-k') === null) return; var k = +b.getAttribute('data-k'); st.hide[k] = !st.hide[k]; update();
  });
  on('#riskBars', 'click', function (e) { var b = e.target.closest && e.target.closest('.rbar'); if (!b || b.getAttribute('data-p') === null) return; st.pd = +b.getAttribute('data-p'); update(); });
  on('#uTbl', 'click', function (e) {
    var th = e.target.closest && e.target.closest('th'); if (th && th.getAttribute('data-s')) { var k = th.getAttribute('data-s'); st.sortDir = st.sortKey === k ? -st.sortDir : (k === 'name' ? 1 : -1); st.sortKey = k; update(); return; }
    var tr = e.target.closest && e.target.closest('tr'); if (tr && tr.getAttribute('data-u') !== null) selectUnit(+tr.getAttribute('data-u'), { zoom: true });
  });
  ['t1', 't2', 't3', 't4', 't5'].forEach(function (k) { on('#' + k, 'change', readThr); });
  on('#thrReset', 'click', function () { st.thr = JSON.parse(JSON.stringify(M.risk.defaults)); saveThr(); update(); });
  on('#chipBack', 'click', function () { goRegion('AF'); });
  on('#chipClear', 'click', function () { selectUnit(null, {}); });
  on('#chipOpen', 'click', function () { if (st.unit === null) return; var iso = M.countries.filter(function (c) { return c.idx === st.unit; })[0]; if (iso) goRegion(iso.iso3); });
  on('#btnExport', 'click', exportSeries); on('#btnTbl', 'click', exportTable);
  wireChart();
}
function readThr() {
  var v = function (k) { return parseFloat($('#' + k).value); };
  var t = { t1: v('t1'), t2: v('t2'), t3: v('t3'), t4: v('t4'), t5: v('t5') }, d = M.risk.defaults;
  Object.keys(t).forEach(function (k) { if (!(t[k] === t[k])) t[k] = d[k]; });
  st.thr = t; saveThr(); update();
}
function saveThr() { try { localStorage.setItem('cdear_thr', JSON.stringify(st.thr)); } catch (e) { /* private mode */ } }

/* ================================================================== EXPORT */
function download(name, text) {
  var b = new Blob([text], { type: 'text/csv' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}
var csvq = function (s) { s = String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function exportSeries() {
  var T = target();
  seriesBoth(T, 'annual').then(function (A) {
    var rows = [['year', 'source', 'scenario', 'crop_type', 'unit'].concat(VARS.map(function (v) { return v.k + '_mm'; })).join(',')];
    var add = function (ts, src, scn) { if (!ts) return; for (var t = 0; t < ts.nt; t++) rows.push([ts.y0 + t, src, scn, cropName(st.crop).toLowerCase(), csvq(targetName())].concat(VARS.map(function (v, i) { var x = ts.at(st.crop, i, t); return x === null ? '' : x; })).join(',')); };
    add(A.h, 'baseline', 'observed'); add(A.f, 'projection', tagF());
    download('cdear_' + (st.region === 'AF' ? 'africa' : st.region) + '_' + targetName().replace(/\W+/g, '_') + '_' + cropName(st.crop).toLowerCase() + '.csv', rows.join('\n'));
  });
}
function exportTable() {
  if (!st._rows) return;
  var rows = [['unit', 'crop_area_ha', 'no_risk_pct', 'low_pct', 'moderate_pct', 'high_pct', 'very_high_pct', 'at_risk_moderate_plus_pct', 'period', 'scenario', 'crop_type'].join(',')], per = M.periods[st.pd];
  st._rows.forEach(function (o) {
    var s = o.s, ok = s && s.tot > 0, f = function (x) { return ok ? x.toFixed(2) : ''; };
    rows.push([csvq(o.name), o.a, ok ? f(s.sh[0]) : '', ok ? f(s.sh[1]) : '', ok ? f(s.sh[2]) : '', ok ? f(s.sh[3]) : '', ok ? f(s.sh[4]) : '', ok ? f(s.mod) : '', per[0] + '-' + per[1], tagF(), cropName(st.crop).toLowerCase()].join(','));
  });
  download('cdear_units_' + st.level + '_' + cropName(st.crop).toLowerCase() + '.csv', rows.join('\n'));
}

/* ================================================================== UPDATE */
function update(o) {
  o = o || {}; var my = ++rid; busy(true); fillControls();
  var T = target(), data = {}, jobs = [], g = st.region === 'AF' ? 'AF' : st.region, L = lvl(g, st.level), needLevel = st.mode === 'units' || st.tab === 'units';
  jobs.push(D.risk(tagF(), T.g, T.l, T.i).then(function (r) { data.rec = r; }));
  jobs.push(seriesBoth(T, 'annual').then(function (r) { data.ann = r; }));
  if (st.tab === 'trend' && st.tf === 'm') jobs.push(seriesBoth(T, 'monthly').then(function (r) { data.mon = r; }));
  if (st.region !== 'AF') jobs.push(ensureGrid());
  if (needLevel && L) { var md = metricDef(), ws = st.mode === 'units' && md.kind !== 'risk'; jobs.push(loadLevel(g, st.level, ws).then(function (c) { data.lvl = c; })); }
  if (st.mode === 'units' || st.region !== 'AF') jobs.push(boundary(g, st.level).then(function (j) { data.bnd = j; }));
  return Promise.all(jobs).then(function () {
    if (my !== rid) return;
    renderMapHead(T); renderKpis(T, data.ann || {}, data.rec);
    var sc = null, vals = null;
    if (st.mode === 'units' && data.lvl && L) { vals = metricVals(data.lvl, L); sc = scaleFor(vals); st._sc = sc; }
    if (st.mode === 'grid' && S && F) { paintGrid(CDEARData.classifyGrid(S, F, st.pd, st.thr, M)); }
    else if (st.mode === 'grid') { goff = null; gridDraw(); showInfo('No grid data for ' + esc(tagF())); }
    else { goff = null; gridDraw(); }
    var bk = [g, st.level, st.mode].join('|'); drawBoundary(data.bnd, g, st.level, st.mode, vals, sc); bKey = bk;
    renderLegend(data.rec);
    if (st.tab === 'trend') renderTrend(data.ann || {}, data.mon || {});
    if (st.tab === 'risk') renderRisk(T, data.rec);
    if (st.tab === 'units' && data.lvl && L) renderUnits(data.lvl, L);
    if (o.fit === 'region') fitRegion();
    busy(false);
  }).catch(function (e) { if (my === rid) { busy(false); setText('#mapSub', 'Error: ' + (e && e.message || e)); if (window.console) console.error(e); } });
}

/* ================================================================== START */
function fatal(msg) { var t = $('#bootTxt'); if (t) t.innerHTML = msg; }
function start() {
  if (typeof L === 'undefined') { fatal('Could not load the map library (Leaflet from unpkg.com). Check the internet connection and reload.'); return; }
  var base = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('data')) || 'dashboard/';
  D = CDEARData.create({ base: base });
  D.manifest().then(function (m) {
    if (!m) { fatal('Could not read <b>' + esc(base) + 'manifest.json</b>.<br>Put the dashboard data folder next to this page (or add <b>?data=folder/</b> to the address) and open the page through a web server, not as a local file.'); return; }
    M = m; st.scn = (M.scenarios.filter(function (s) { return M.tags.some(function (t) { return t.indexOf(s + '_') === 0; }); })[0]) || M.scenarios[0];
    st.gcm = M.gcms[0]; st.pd = Math.min(1, M.periods.length - 1); st.thr = JSON.parse(JSON.stringify(M.risk.defaults));
    try { var sv = JSON.parse(localStorage.getItem('cdear_thr') || 'null'); if (sv && sv.t1 !== undefined) st.thr = sv; } catch (e) { /* ignore */ }
    var bar = $('#bootBar'); if (bar) bar.style.width = '60%';
    return D.units('AF').then(function (u) {
      if (!u) { fatal('units/AF.json not found in <b>' + esc(base) + '</b>'); return; }
      UJ.AF = u; initMap(); wire();
      var first = M.countries.length === 1 ? M.countries[0].iso3 : 'AF';
      return goRegion(first).then(function () { var b = $('#boot'); if (b) b.style.display = 'none'; if (map.invalidateSize) { map.invalidateSize(); } gridPlace(); });
    });
  }).catch(function (e) {
    var hint = (typeof location !== 'undefined' && location.protocol === 'file:') ? '<br>The page was opened as a local file: open it through a web server instead (for example <b>python -m http.server</b> in this folder).' : '';
    fatal('Error while starting: ' + esc(e && e.message || e) + hint); if (window.console) console.error(e);
  });
}
window.CDEAR_TEST = { st: st, update: update, goRegion: goRegion, selectUnit: selectUnit, target: target, riskSum: riskSum, metricVals: metricVals, readThr: readThr, exportTable: exportTable,
  get S() { return S; }, get F() { return F; }, get M() { return M; }, get rows() { return st._rows; }, eff: eff, renderTrend: renderTrend, classInfo: classInfo };
if (typeof document !== 'undefined' && !window.CDEAR_NO_AUTOSTART) start();
})();
