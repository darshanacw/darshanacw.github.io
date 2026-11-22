/* =============================================================================
   cdear_data.js  -  reads the dashboard data written by D05 and does the risk-class maths in the browser
   Works in a browser (fetch + DecompressionStream) and in Node (pass opts.fetchBytes).
   Every stored data value is an integer (mm, ha, class counts); only the ratio thresholds t4 / t5 are decimals.

     const D = CDEARData.create({ base: 'dashboard/' });           // folder that holds manifest.json
     const M = await D.manifest();
     const U = await D.units('ETH');                               // U.levels.adm1.name[i] ...  bbox = c0,r0,c1,r1 (grid column / row)
     const S = await D.gridStatic('ETH');                          // crop cells of a country: S.a.crop (0 rainfed, 1 irrigated), S.a.ha
     const F = await D.gridFuture('ETH', 'ssp585_ACCESS-CM2');
     const cls = CDEARData.classifyGrid(S, F, 1, thr, M);          // class of every cell for period 1 (its own crop type's rule)
     const R = await D.risk('ssp585_ACCESS-CM2', 'ETH', 'adm1', 5);
     const a = CDEARData.riskAreas(R, 1, 0, thr, M);               // ha per class of unit 5, rainfed cells (crop 0), same thresholds
     const ts = await D.series('ssp585_ACCESS-CM2', 'ETH', 'adm1', 5, 'annual');   // ts.at(crop, var, t)
   thr = { t1, t2, t3, t4, t5 } : t1..t3 in mm (whole numbers), t4 and t5 = ratios BET_f / BET_h, e.g. 1.10 and 1.25.
   ============================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CDEARData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var SZ = { u8: 1, i16: 2, u16: 2, i32: 4 };
  var TA = { u8: Uint8Array, i16: Int16Array, u16: Uint16Array, i32: Int32Array };
  var NA16 = -32768;

  /* ---------- container: uint32 H | H bytes JSON | arrays (each padded to 4 bytes) ---------- */
  function decodeBin(buf) {
    var dv = new DataView(buf), hl = dv.getUint32(0, true);
    var hdr = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, hl)));
    var off = 4 + hl, a = {};
    hdr.arrays.forEach(function (m) {
      a[m.name] = new TA[m.type](buf, off, m.n);
      off += Math.ceil(m.n * SZ[m.type] / 4) * 4;
    });
    return { hdr: hdr, a: a };
  }
  function gunzip(buf) {
    var u = new Uint8Array(buf);
    if (u[0] !== 0x1f || u[1] !== 0x8b) return Promise.resolve(buf);                 // already plain (server unzipped it)
    if (typeof DecompressionStream !== 'undefined')
      return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    var out = require('zlib').gunzipSync(Buffer.from(buf));                          // Node
    return Promise.resolve(out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength));
  }
  function defaultFetch(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) { var e = new Error('HTTP ' + r.status + ' ' + url); e.status = r.status; throw e; }
      return r.arrayBuffer();
    });
  }
  function fill(tpl, v) { return tpl.replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }

  /* ---------- loader with cache ---------- */
  function create(opts) {
    var base = (opts.base || '').replace(/\/?$/, '/'), fb = opts.fetchBytes || defaultFetch, cache = new Map(), M = null;
    function get(path, json) {
      if (!cache.has(path)) {
        cache.set(path, fb(base + path).then(function (b) { return gunzip(b); }).then(function (b) {
          return json ? JSON.parse(new TextDecoder().decode(b)) : decodeBin(b);
        }).catch(function (e) {
          cache.delete(path);
          if (e && (e.status === 404 || e.code === 'ENOENT')) return null;           // file does not exist = no data
          throw e;
        }));
      }
      return cache.get(path);
    }
    var api = {
      get: get,
      manifest: function () { return get('manifest.json', true).then(function (m) { M = m; return m; }); },
      units: function (group) { return get(fill(M.files.units, { group: group }), true); },
      boundary: function (group, level) { return get(fill(M.files.boundary, { group: group, level: level }), true); },
      gridStatic: function (iso) { return get(fill(M.files.grid_static, { iso3: iso }), false); },
      gridFuture: function (iso, tag) { return get(fill(M.files.grid_future, { iso3: iso, tag: tag }), false); },
      /* one unit of an annual / monthly series file. at(crop, variable, t): crop 0 rainfed / 1 irrigated, variable 0..4 (P,PET,AET,GET,BET),
         t = year index (annual) or year index*12 + month (monthly). null when the series does not exist. */
      series: function (tag, group, level, idx, freq) {
        var ch = freq === 'annual' ? M.chunk.annual : M.chunk.monthly, c = Math.floor(idx / ch);
        return get(fill(freq === 'annual' ? M.files.ts_annual : M.files.ts_monthly, { tag: tag, group: group, level: level, chunk: c }), false).then(function (f) {
          if (!f) return null;
          var h = f.hdr, rec = h.ncrop * h.nvar * h.nt, o = (idx - h.first) * rec, d = f.a.d.subarray(o, o + rec);
          return { y0: h.y0, y1: h.y1, nt: h.nt, nvar: h.nvar, data: d,
                   at: function (crop, v, t) { var x = d[(crop * h.nvar + v) * h.nt + t]; return x === NA16 ? null : x; } };
        });
      },
      /* risk histogram of one unit: Int32Array [period][len_rf + len_ir] */
      risk: function (tag, group, level, idx) {
        var c = Math.floor(idx / M.chunk.risk);
        return get(fill(M.files.risk, { tag: tag, group: group, level: level, chunk: c }), false).then(function (f) {
          if (!f) return null;
          var h = f.hdr, rec = h.np * (h.len_rf + h.len_ir), o = (idx - h.first) * rec;
          return f.a.h.subarray(o, o + rec);
        });
      }
    };
    return api;
  }

  /* ---------- thresholds: the histograms have a fixed resolution, so thresholds are snapped to it ----------
     t1..t3 in mm (steps of rf_bw), t4 and t5 ratios (steps of 0.01). Returns the snapped values (e.t1..e.t5) and the bin numbers. */
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function effectiveThresholds(thr, M) {
    var R = M.risk, b1 = clamp(Math.round(thr.t1 / R.rf_bw), 0, R.rf_nb - 1), b2 = clamp(Math.round(thr.t2 / R.rf_bw), 0, R.rf_nb - 1),
        b3 = clamp(Math.round(thr.t3 / R.rf_bw), 0, R.rf_nb - 1), k4 = clamp(Math.round(thr.t4 * 100) - 100, 0, R.ir_nb - 1),
        k5 = clamp(Math.round(thr.t5 * 100) - 100, 0, R.ir_nb - 1);       // k = allowed increase in whole percent (integer maths below)
    b2 = Math.max(b2, b1); b3 = Math.max(b3, b2); k5 = Math.max(k5, k4);
    return { b1: b1, b2: b2, b3: b3, k4: k4, k5: k5, t1: b1 * R.rf_bw, t2: b2 * R.rf_bw, t3: b3 * R.rf_bw, t4: (100 + k4) / 100, t5: (100 + k5) / 100 };
  }

  /* ---------- class of one cell (integer maths; the same rule as the histograms) ---------- */
  function classRainfed(GETf, BETf, GETh, e) {
    if (GETf === NA16 || BETf === NA16 || GETh === NA16) return -1;
    if (GETf >= GETh) return 0;
    if (BETf < e.t1) return 1;
    if (BETf < e.t2) return 2;
    if (BETf < e.t3) return 3;
    return 4;
  }
  function classIrrigated(BETf, BETh, e) {
    if (BETf === NA16 || BETh === NA16) return -1;
    if (BETf <= BETh) return 0;
    var d = (BETf - BETh) * 100;                      // increase in percent < k  <=>  100 (BETf - BETh) < k BETh
    if (d < e.k4 * BETh) return 1;
    if (d < e.k5 * BETh) return 2;
    return 3;                                          // includes BETh = 0 with BETf > 0
  }
  /* class of every cell of a country for period p (0-based). Each cell has ONE crop type (S.a.crop): rainfed cells use the rainfed
     rule (0-4), irrigated cells the irrigated rule (0-3). -1 = no data. Use S.a.crop to separate the two on the map. */
  function classifyGrid(S, F, p, thr, M) {
    var e = effectiveThresholds(thr, M), n = S.hdr.n, out = new Int8Array(n), crop = S.a.crop,
        GETh = S.a.h_GET, BETh = S.a.h_BET, GETf = F.a['p' + (p + 1) + '_GET'], BETf = F.a['p' + (p + 1) + '_BET'];
    for (var i = 0; i < n; i++) out[i] = crop[i] === 0 ? classRainfed(GETf[i], BETf[i], GETh[i], e) : classIrrigated(BETf[i], BETh[i], e);
    return out;
  }
  /* crop area (ha) per class of one unit from its histogram. crop 0 = rainfed cells: c0..c4; crop 1 = irrigated cells: c0..c3 (c4 = 0); nd = no data */
  function riskAreas(rec, p, crop, thr, M) {
    var R = M.risk, L = R.len_rf + R.len_ir, e = effectiveThresholds(thr, M), o = p * L + (crop === 0 ? 0 : R.len_rf), r = { c0: rec[o], c1: 0, c2: 0, c3: 0, c4: 0, nd: 0 }, j;
    if (crop === 0) {
      for (j = 0; j < R.rf_nb; j++) { var a = rec[o + 1 + j]; if (j < e.b1) r.c1 += a; else if (j < e.b2) r.c2 += a; else if (j < e.b3) r.c3 += a; else r.c4 += a; }
      r.nd = rec[o + R.rf_nb + 1];
    } else {
      for (j = 0; j < R.ir_nb; j++) { var b = rec[o + 1 + j]; if (j < e.k4) r.c1 += b; else if (j < e.k5) r.c2 += b; else r.c3 += b; }
      r.c3 += rec[o + R.ir_nb + 1];                    // BET_h = 0 and BET_f > 0
      r.nd = rec[o + R.ir_nb + 2];
    }
    r.total = r.c0 + r.c1 + r.c2 + r.c3 + r.c4;
    return r;
  }
  /* index of the cell that contains lon/lat (binary search in the ascending cell numbers), or -1 */
  function cellAt(S, lon, lat, M) {
    var g = M.grid, col = Math.floor((lon - g.xmin) * g.per_deg), row = Math.floor((g.ymax - lat) * g.per_deg);
    if (col < 0 || col >= g.ncol || row < 0 || row >= g.nrow) return -1;
    var id = row * g.ncol + col, a = S.a.cell0, lo = 0, hi = a.length - 1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (a[m] === id) return m; if (a[m] < id) lo = m + 1; else hi = m - 1; }
    return -1;
  }
  function cellBounds(cell0, M) {                      // [west, south, east, north] of a cell, in degrees
    var g = M.grid, col = cell0 % g.ncol, row = Math.floor(cell0 / g.ncol);
    return [g.xmin + col / g.per_deg, g.ymax - (row + 1) / g.per_deg, g.xmin + (col + 1) / g.per_deg, g.ymax - row / g.per_deg];
  }
  function gridBox(c0, r0, c1, r1, M) {                // bounding box given as grid column / row numbers -> [west, south, east, north]
    var g = M.grid;
    return [g.xmin + c0 / g.per_deg, g.ymax - r1 / g.per_deg, g.xmin + c1 / g.per_deg, g.ymax - r0 / g.per_deg];
  }
  return { decodeBin: decodeBin, create: create, effectiveThresholds: effectiveThresholds, classRainfed: classRainfed,
           classIrrigated: classIrrigated, classifyGrid: classifyGrid, riskAreas: riskAreas, cellAt: cellAt, cellBounds: cellBounds,
           gridBox: gridBox, NA16: NA16 };
});
