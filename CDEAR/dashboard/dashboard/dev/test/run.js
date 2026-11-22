// Smoke + correctness test of the REAL dashboard code (src/app.js) against the fixture data.
const fs = require('fs'), path = require('path');
const stub = require('./stub.js');
const { elements: E, downloads } = stub;
const root = path.join(__dirname, '..');
global.CDEARData = require(path.join(root, 'src', 'cdear_data.js'));
let fails = 0, checks = 0; const ok = (c, m) => { checks++; if (!c) { fails++; console.log('FAIL:', m); } };
const errors = []; const oe = console.error; console.error = (...a) => { errors.push(a.map(String).join(' ')); };
process.on('unhandledRejection', (e) => { errors.push('unhandledRejection ' + (e && e.stack || e)); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settled() { for (let i = 0; i < 80; i++) { await sleep(25); if (!E.busy.className.includes(' on')) { await sleep(25); if (!E.busy.className.includes(' on')) return; } } }
const T = () => global.CDEAR_TEST;
const png = (cv, name) => cv.toFile(path.join(root, 'test', 'out', name));
fs.mkdirSync(path.join(root, 'test', 'out'), { recursive: true });
function click(containerId, attr, val) { const c = E[containerId]; const b = c._children.find((x) => x.getAttribute(attr) === String(val)); if (!b) throw new Error('no button ' + containerId + ' ' + attr + '=' + val); c._h.click[0]({ target: { closest: (s) => (s === 'button' ? b : null) } }); }
function setSel(id, v) { E[id].value = String(v); E[id]._h.change[0]({ target: E[id] }); }
const text = (id) => E[id].textContent;

(async () => {
  // ------------------------------------------------------------------ boot
  const src = fs.readFileSync(path.join(root, 'src', 'app.js'), 'utf8');
  (0, eval)(src);
  for (let i = 0; i < 120 && !(T() && T().M && E.boot.style.display === 'none'); i++) await sleep(50);
  await settled();
  ok(T() && T().M, 'manifest loaded'); ok(E.boot.style.display === 'none', 'boot screen hidden: ' + E.bootTxt.textContent);
  ok(T().st.region === 'TST' && T().st.mode === 'grid', 'single-country data starts in that country with the grid: ' + T().st.region + '/' + T().st.mode);
  ok(errors.length === 0, 'no console errors at start: ' + errors.join(' | '));
  console.log('KPIs:', ['k1', 'k2', 'k3', 'k4', 'k5'].map((k) => text(k + 'l') + ' = ' + text(k)).join(' | '));
  console.log('Title:', text('mapTitle'), '|', text('mapSub'));

  // ------------------------------------------------------------------ KPI at-risk value == per-cell classification of the grid
  const M = T().M, S = T().S, F = T().F, thr = T().st.thr;
  function cellAreas(crop, pd, unitArr, unit, thrx) {
    const cls = CDEARData.classifyGrid(S, F, pd, thrx || T().st.thr, M), a = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < cls.length; i++) { if (S.a.crop[i] !== crop) continue; if (unit !== null && unitArr[i] - 1 !== unit) continue; a[cls[i] < 0 ? 5 : cls[i]] += S.a.ha[i]; }
    return a;
  }
  function riskCheck(label) {
    const tg = T().target(), st = T().st;
    return D_risk(tg).then((rec) => {
      const r = CDEARData.riskAreas(rec, st.pd, st.crop, st.thr, M), unitArr = tg.g === 'TST' ? S.a[tg.l] : null;
      const g = cellAreas(st.crop, st.pd, unitArr, tg.g === 'TST' ? tg.i : null);
      ok([r.c0, r.c1, r.c2, r.c3, r.c4, r.nd].every((v, j) => v === g[j]), label + ': histogram areas = per-cell areas ' + JSON.stringify([r.c0, r.c1, r.c2, r.c3, r.c4, r.nd]) + ' vs ' + JSON.stringify(g));
      const modPlus = (r.c2 + r.c3 + r.c4) / r.total * 100; return modPlus;
    });
  }
  const api = CDEARData.create({ base: 'dashboard/' }); let Mm = null;
  Mm = await api.manifest();
  const D_risk = (tg) => api.risk(T().st.scn + '_' + T().st.gcm, tg.g, tg.l, tg.i);
  let mod = await riskCheck('country/rainfed');
  ok(text('k5').trim() === (mod < 10 && mod > 0 ? mod.toFixed(1) : mod.toFixed(0)) + '%', 'KPI at-risk share = ' + mod.toFixed(2) + ' got ' + text('k5'));

  // ------------------------------------------------------------------ grid layer is painted (rainfed cells coloured)
  const gp = global.__map.map._panes.grid, gcv = gp._children[0];
  const px = gcv.getContext('2d').getImageData(0, 0, 800, 600).data; let painted = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 0) painted++;
  ok(painted > 2000, 'grid canvas has painted pixels: ' + painted); png(gcv, 'grid_rainfed.png');
  ok(gp._children[0]._pos !== undefined, 'grid canvas positioned');
  // hover + click on a cell
  const i0 = [...S.a.crop].findIndex((c) => c === 0), b0 = CDEARData.cellBounds(S.a.cell0[i0], M), ll = { lng: (b0[0] + b0[2]) / 2, lat: (b0[1] + b0[3]) / 2 };
  global.__map.events.mousemove[0]({ latlng: ll }); await sleep(30);
  ok(E.mapInfo.innerHTML.includes('Rainfed cell') && E.mapInfo.innerHTML.includes('Green ET'), 'hover shows cell info');
  global.__map.events.click[0]({ latlng: ll }); await settled();
  ok(T().st.unit !== null, 'click on a cell selects its unit: ' + T().st.unit);
  mod = await riskCheck('country/rainfed/clicked unit ' + T().st.unit); console.log('selected', T().target(), '->', text('k5l'), text('k5'));
  png(gcv, 'grid_rainfed_unit_selected.png');
  ok(!E.chipClear.hidden, 'clear chip visible');

  // ------------------------------------------------------------------ crop switch, level switch, period
  click('fCrop', 'data-c', 1); await settled(); ok(T().st.crop === 1, 'crop = irrigated'); await riskCheck('irrigated'); png(gcv, 'grid_irrigated.png');
  ok(E.k1l.textContent.startsWith('Irrigated'), 'KPI label irrigated');
  setSel('fLevel', 'adm2'); await settled(); ok(T().st.level === 'adm2' && T().st.unit === null, 'level adm2');
  setSel('fUnit', '4'); await settled(); ok(T().st.unit === 4, 'unit picked from list'); await riskCheck('adm2 unit 4 irrigated');
  setSel('fPer', '3'); await settled(); ok(T().st.pd === 3, 'period 4'); await riskCheck('period 4');
  setSel('fLevel', 'cbasin'); await settled(); await riskCheck('basin-in-country');
  setSel('fScn', 'ssp126'); await settled(); await riskCheck('ssp126');
  ok(errors.length === 0, 'no errors so far: ' + errors.join(' | '));

  // ------------------------------------------------------------------ thresholds: change -> everything follows
  click('fCrop', 'data-c', 0); await settled(); setSel('fLevel', 'adm1'); await settled(); setSel('fPer', '1'); await settled();
  const before = E.k5.textContent;
  E.t1.value = '300'; E.t2.value = '350'; E.t3.value = '400'; E.t4.value = '1.5'; E.t5.value = '1.8'; T().readThr(); await settled();
  ok(JSON.stringify(T().st.thr) === JSON.stringify({ t1: 300, t2: 350, t3: 400, t4: 1.5, t5: 1.8 }), 'thresholds stored ' + JSON.stringify(T().st.thr));
  await riskCheck('new thresholds rainfed'); console.log('at-risk share: default', before, '-> t1..t3 = 300/350/400:', E.k5.textContent);
  click('fCrop', 'data-c', 1); await settled(); await riskCheck('new thresholds irrigated');
  E.t1.value = '103'; E.t2.value = '90'; E.t3.value = '1000'; E.t4.value = '1.234'; E.t5.value = '1.2'; T().readThr(); await settled();
  click('tabs', 'data-t', 'risk'); await settled();
  const e = T().eff(); ok(e.t1 === 105 && e.t2 === 105 && e.t3 === 600 && Math.abs(e.t4 - 1.23) < 1e-9 && Math.abs(e.t5 - 1.23) < 1e-9, 'thresholds snapped/ordered ' + JSON.stringify(e));
  ok(E.t1.value == 105 && E.t4.value === '1.23', 'inputs show the snapped values');
  E._h = E._h; E.thrReset._h.click[0](); await settled(); ok(JSON.stringify(T().st.thr) === JSON.stringify(M.risk.defaults), 'reset to defaults');
  click('fCrop', 'data-c', 0); await settled();

  // ------------------------------------------------------------------ tabs: trends (annual / monthly cycle / monthly series), risk, units
  click('tabs', 'data-t', 'trend'); await settled();
  console.log('Summary table rows:', (E.sumTbl.innerHTML.match(/<tr>/g) || []).length); ok((E.sumTbl.innerHTML.match(/<tr>/g) || []).length === 6, 'summary table 5 rows + header');
  png(E.chart, 'chart_annual.png');
  const sp = E.chart._sp; ok(sp && sp.lines.length > 5, 'annual chart has lines'); ok(sp.tip(2050).includes('projection'), 'annual tooltip');
  click('tf', 'data-t', 'm'); await settled(); png(E.chart, 'chart_monthly_cycle.png'); ok(E.chart._sp.x1 === 12.5, 'monthly cycle chart');
  ok(E.chart._sp.tip(7).includes('baseline'), 'cycle tooltip');
  click('mm', 'data-m', 'series'); await settled(); png(E.chart, 'chart_monthly_series.png'); ok(E.chart._sp.x1 > 2100, 'monthly series chart');
  ok(E.chart._sp.tip(2050 + 1 / 24 + 6 / 12).includes('2050'), 'series tooltip: ' + E.chart._sp.tip(2050.54));
  click('tf', 'data-t', 'a'); await settled();
  E.varChips._h.click[0]({ target: { closest: () => ({ getAttribute: () => 'P' }) } }); await settled(); ok(T().st.vars.P === 0, 'toggle a variable'); png(E.chart, 'chart_annual_noP.png');
  E.varChips._h.click[0]({ target: { closest: () => ({ getAttribute: () => 'P' }) } }); await settled();
  click('tabs', 'data-t', 'risk'); await settled(); ok(E.riskBars.innerHTML.includes('rbar') && E.riskTbl.innerHTML.includes('Very high'), 'risk tab rendered'); ok(E.pRisk.hidden === false && E.pTrend.hidden === true, 'panes toggle');
  E.riskBars._h.click[0]({ target: { closest: () => ({ getAttribute: (k) => (k === 'data-p' ? '2' : null) }) } }); await settled(); ok(T().st.pd === 2, 'click a period bar');
  click('tabs', 'data-t', 'units'); await settled(); ok(T().rows && T().rows.length === 3, 'units table rows (adm1 rainfed): ' + (T().rows || []).length);
  E.uTbl._h.click[0]({ target: { closest: (s) => (s === 'th' ? { getAttribute: (k) => (k === 'data-s' ? 'name' : null) } : null) } }); await settled(); ok(T().st.sortKey === 'name', 'sort by name');
  E.uTbl._h.click[0]({ target: { closest: (s) => (s === 'th' ? null : { getAttribute: (k) => (k === 'data-u' ? '1' : null) }) } }); await settled(); ok(T().st.unit === 1, 'row click selects unit');
  T().exportTable(); ok(downloads.length >= 1, 'table CSV produced');
  const csv = await downloads[downloads.length - 1].text(); ok(csv.split('\n').length === 4 && csv.includes('Central'), 'table CSV content: ' + csv.split('\n')[1]);
  E.btnExport._h.click[0](); await sleep(80); const csv2 = await downloads[downloads.length - 1].text(); ok(csv2.split('\n').length === 13 + 86 + 1, 'series CSV rows ' + csv2.split('\n').length); console.log(csv2.split('\n').slice(0, 3).join('\n'));

  // ------------------------------------------------------------------ unit summary (choropleth) inside the country
  click('tabs', 'data-t', 'trend'); await settled();
  click('mapMode', 'data-m', 'units'); await settled(); ok(T().st.mode === 'units', 'unit summary mode');
  let bl = global.__map.layers.filter((l) => l.feats).pop(); ok(bl && bl.opt.interactive === true && bl.feats.length === 3, 'adm1 choropleth layer with 3 units'); console.log('choropleth fills:', bl.styles.map((s) => s.fillColor).join(' '));
  ok(bl.styles.every((s) => s.fillColor && s.fillColor.startsWith('rgb')), 'every unit coloured');
  ok(bl.layers[0]._tip().includes('area'), 'unit tooltip'); bl.layers[1]._h.click(); await settled(); ok(T().st.unit === 1, 'polygon click selects');
  for (const m of ['risk_any', 'risk_high', 'dP', 'dPET', 'dGET', 'dBET']) { setSel('fMetric', m); await settled(); bl = global.__map.layers.filter((l) => l.feats).pop(); ok(bl.styles.every((s) => s.fillColor && s.fillColor !== '#8a97a6'), 'metric ' + m + ' coloured: ' + bl.styles.map((s) => s.fillColor).join(' ')); }
  ok(E.legend.innerHTML.includes('lgBar'), 'gradient legend');

  // ------------------------------------------------------------------ Africa level: countries / basins / sub-basins, no grid
  click('tabs', 'data-t', 'units'); await settled();
  E.chipBack._h.click[0](); await settled(); ok(T().st.region === 'AF' && T().st.mode === 'units' && T().st.level === 'country', 'back to Africa');
  ok(global.__map.layers.filter((l) => l.feats).pop().feats.length === 1, 'country layer: 1 country'); ok(T().rows.length === 1, 'country table row');
  setSel('fLevel', 'basin'); await settled(); ok(T().rows.length === 2, 'basin table: only the 2 basins with rainfed crop: ' + T().rows.length);
  setSel('fLevel', 'subbasin'); await settled(); ok(T().rows.length === 4, 'sub-basin table 4: ' + T().rows.length);
  click('tabs', 'data-t', 'trend'); await settled();
  setSel('fLevel', 'country'); await settled(); setSel('fUnit', '0'); await settled(); ok(!E.chipOpen.hidden && E.chipOpen.textContent.includes('Testland'), 'open-country chip: ' + E.chipOpen.textContent);
  E.chipOpen._h.click[0](); await settled(); ok(T().st.region === 'TST' && T().st.mode === 'grid', 'drill down to the country');
  setSel('fRegion', 'AF'); await settled(); ok(T().st.region === 'AF', 'region select back to Africa'); setSel('fRegion', 'TST'); await settled(); ok(T().st.region === 'TST', 'region select to country');

  // ------------------------------------------------------------------ edge cases
  const keep = T().st.region; await T().goRegion('XXX'); await settled(); ok(T().st.region === keep, 'unknown country leaves the state unchanged'); ok(E.mapSub.textContent.includes('XXX'), 'message shown: ' + E.mapSub.textContent);
  click('fCrop', 'data-c', 1); await settled(); setSel('fLevel', 'adm1'); await settled();
  ok(errors.length === 0, 'no errors at the end: ' + errors.join(' | '));
  const miss = global.__fetched.filter((u) => /undefined|NaN/.test(u)); ok(miss.length === 0, 'no malformed URLs ' + miss.join(','));
  console.log('files requested:', new Set(global.__fetched).size, '| checks:', checks);
  console.log(fails ? fails + ' FAILURES' : 'ALL DASHBOARD TESTS PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('TEST CRASHED', e && e.stack || e); process.exit(2); });
