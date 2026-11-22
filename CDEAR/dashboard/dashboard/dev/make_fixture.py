# Builds a small dashboard data folder in EXACTLY the format that D01-D05 write (see D_functions.R / D05_write_dashboard_files.R)
# Fake country TST ("Testland"): 3 admin-1, 9 admin-2, no admin-3, 2 basins-in-country, 4 sub-basins-in-country.
# Africa group AF: continent (1), country (1), basin (5, only #1 and #3 have crop), subbasin (6, #0 #2 #3 #5 have crop).
import numpy as np, json, gzip, struct, os, shutil, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else "fixture/data"
rng = np.random.default_rng(11)
shutil.rmtree(OUT, ignore_errors=True)
RF_BW, RF_NB, IR_NB = 5, 121, 101
LEN_RF, LEN_IR = RF_NB + 2, IR_NB + 3
NC, NR, X0, Y1, PER = 10800, 8760, -26, 38, 120
VK = ["P", "PET", "AET", "GET", "BET"]
HY = list(range(2013, 2026)); FY = list(range(2015, 2101))
PERIODS = [[2021, 2040], [2041, 2060], [2061, 2080], [2081, 2100]]
TAGS = ["ssp126_ACCESS-CM2", "ssp245_ACCESS-CM2"]
CH_A, CH_M, CH_R = 4, 2, 3                                    # small chunk sizes -> several chunks per level
NA16 = -32768

def wfile(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f: f.write(data)
def gzjson(path, obj):
    wfile(path, gzip.compress(json.dumps(obj, separators=(",", ":")).encode("utf8")))
def write_bin(path, header, arrays):
    header = dict(header); header["arrays"] = [{"name": n, "type": t, "n": int(len(d))} for n, (t, d) in arrays.items()]
    hj = json.dumps(header, separators=(",", ":")).encode(); hj += b" " * ((4 - len(hj) % 4) % 4)
    buf = bytearray(struct.pack("<I", len(hj))) + hj
    dt = {"u8": "<u1", "i16": "<i2", "u16": "<u2", "i32": "<i4"}
    for n, (t, d) in arrays.items():
        a = np.asarray(d)
        if t == "i16": a = np.where(np.isnan(a.astype(float)), NA16, a)
        b = a.astype(dt[t]).tobytes(); buf += b + b"\0" * ((4 - len(b) % 4) % 4)
    wfile(path, gzip.compress(bytes(buf)))

# ---------------------------------------------------------------- cells of the fake country
C0, C1, R0, R1 = 6000, 6160, 4000, 4130                     # lon 24.0-25.33, lat 4.67-3.58
cc, rr = np.meshgrid(np.arange(C0, C1), np.arange(R0, R1))
cc = cc.ravel(); rr = rr.ravel()
blob = ((cc - 6080) / 85.0) ** 2 + ((rr - 4065) / 70.0) ** 2 < 1
keep = blob & (rng.random(len(cc)) < 0.6)
cc, rr = cc[keep], rr[keep]; n = len(cc)
cell0 = (rr * NC + cc).astype(np.int32); o = np.argsort(cell0); cell0, cc, rr = cell0[o], cc[o], rr[o]
crop = (rng.random(n) < 0.18).astype(int); ha = rng.integers(20, 80, n)
rf = np.where(crop == 0, ha, 0); ir = np.where(crop == 1, ha, 0)
colf = (cc - C0) / (C1 - C0); rowf = (rr - R0) / (R1 - R0)
a1 = 1 + np.minimum((colf * 3).astype(int), 2)                              # admin-1: column thirds (unit number 1..3)
a2 = 1 + np.minimum((rowf * 3).astype(int), 2) * 3 + (a1 - 1)               # admin-2: 3 x 3 blocks (1..9)
cb = np.where(colf + rowf < 1.0, 1, 2)                                      # basin-in-country: 1 / 2
cs = np.where(rowf < 0.5, np.where(colf < 0.5, 1, 2), np.where(colf < 0.5, 3, 4))   # sub-basin-in-country 1..4
print("cells:", n, "rainfed:", int((crop == 0).sum()), "irrigated:", int((crop == 1).sum()))

# ---------------------------------------------------------------- cell-level annual values for every tag
def cell_years(kind, years, scn):
    """returns dict var -> [cells x years] ints. kind 'hist' or 'fut'"""
    ny = len(years); t = np.array(years) - 2015
    P0 = 700 + 500 * np.sin(colf * 3.0) ** 2 + 300 * rowf
    PET0 = 1500 + 300 * rowf + 120 * colf
    d = {}
    if kind == "hist": trend = np.zeros(ny)
    else: trend = (-0.0007 if scn == "ssp126" else -0.0016) * t
    noise = rng.normal(0, 0.07, (n, ny))
    P = P0[:, None] * (1 + trend[None, :] + noise)
    PET = PET0[:, None] * (1 + (0.0006 if scn == "ssp126" else 0.0012) * (t[None, :] if kind != "hist" else 0) + rng.normal(0, 0.03, (n, ny)))
    GET = 0.55 * P * (1 + rng.normal(0, 0.04, (n, ny)))
    AET = np.minimum(PET * (0.42 + 0.00015 * (t[None, :] if kind != "hist" else 0)), P * 0.95 + 150) * (1 + rng.normal(0, 0.03, (n, ny)))
    BET = np.maximum(AET - GET, 0)
    for k, v in zip(VK, (P, PET, AET, GET, BET)): d[k] = np.round(np.maximum(v, 0)).astype(int)
    return d
hist = cell_years("hist", HY, "ssp126")
hist["BET"][rng.random(n) < 0.08, :] = 0                                    # BET_h = 0 cells
fut = {tg: cell_years("fut", FY, tg.split("_")[0]) for tg in TAGS}
mean_h = {k: np.round(hist[k].mean(1)).astype(int) for k in VK}
mean_f = {tg: {p: {k: np.round(fut[tg][k][:, [FY.index(y) for y in range(a, b + 1)]].mean(1)).astype(int) for k in VK}
               for p, (a, b) in enumerate(PERIODS)} for tg in TAGS}

# ---------------------------------------------------------------- groupings (value 0 = none, else unit number within its list + 1)
Z = np.zeros(n, int)
AFB = {1: 2, 2: 4}                      # basin-in-country 1 -> AF basin idx 1 ; 2 -> idx 3
AFS = {1: 0, 2: 2, 3: 3, 4: 5}          # sub-basin-in-country -> AF sub-basin idx
G = {"AF": {"continent": np.ones(n, int), "country": np.ones(n, int),
            "basin": np.array([AFB[v] for v in cb]), "subbasin": np.array([AFS[v] + 1 for v in cs])},
     "TST": {"adm1": a1, "adm2": a2, "cbasin": cb, "csubbasin": cs}}
NU = {"AF": {"continent": 1, "country": 1, "basin": 5, "subbasin": 6}, "TST": {"adm1": 3, "adm2": 9, "cbasin": 2, "csubbasin": 4}}
LV_ORDER = {"AF": ["continent", "country", "basin", "subbasin"], "TST": ["adm1", "adm2", "cbasin", "csubbasin"]}
NAMES = {"continent": ["Africa"], "country": ["Testland"],
         "basin": [f"Basin {i}" for i in range(5)], "subbasin": [f"Sub-basin {i}" for i in range(6)],
         "adm1": ["North", "Central", "South"], "adm2": [f"District {i+1}" for i in range(9)],
         "cbasin": ["Upper basin", "Lower basin"], "csubbasin": [f"Sub-basin {c}" for c in "ABCD"]}
PARENT = {"continent": [-1], "country": [0], "basin": [-1] * 5, "subbasin": [-1, 1, -1, 1, -1, 3],
          "adm1": [-1] * 3, "adm2": [(i % 3) for i in range(9)], "cbasin": [-1, -1], "csubbasin": [0, 1, 0, 1]}
for lv in ("subbasin",): PARENT[lv] = [1, 1, 3, 3, 1, 3]
PARENT["csubbasin"] = [0, 0, 1, 1]

def unit_mask(g, lv, u): return G[g][lv] == (u + 1)
def agg_unit(m, crop_type, arr):
    """area-weighted mean over the cells of one crop type in the mask: arr [cells x T] -> [T] (NaN if none)"""
    w = (rf if crop_type == 0 else ir) * m
    if w.sum() == 0: return np.full(arr.shape[1], np.nan)
    return (arr * w[:, None]).sum(0) / w.sum()

# ---------------------------------------------------------------- units/{group}.json
def u_stats(g, lv):
    out = []
    for u in range(NU[g][lv]):
        m = unit_mask(g, lv, u)
        if lv == "continent": m = np.ones(n, bool)
        c = cc[m]; r = rr[m]
        out.append(dict(rf=int(rf[m].sum()), ir=int(ir[m].sum()), cells=int(m.sum()),
                        c0=int(c.min()) if m.any() else None, r0=int(r.min()) if m.any() else None,
                        c1=int(c.max()) + 1 if m.any() else None, r1=int(r.max()) + 1 if m.any() else None))
    return out
UJ = {}
for g in ("AF", "TST"):
    levels = {}
    for lv in LV_ORDER[g]:
        st = u_stats(g, lv); nu = NU[g][lv]
        levels[lv] = dict(n=nu, code=[f"{lv}{i}" for i in range(nu)], name=NAMES[lv], parent=PARENT[lv], ref=[None if lv in ("continent", "country") else i + 1 for i in range(nu)],
                          rf=[s["rf"] for s in st], ir=[s["ir"] for s in st], cells=[s["cells"] for s in st],
                          c0=[s["c0"] for s in st], r0=[s["r0"] for s in st], c1=[s["c1"] for s in st], r1=[s["r1"] for s in st])
    UJ[g] = {"group": g, "levels": levels}
    wfile(f"{OUT}/units/{g}.json", json.dumps(UJ[g]).encode())

# ---------------------------------------------------------------- grid files
def locnum(a): return a.astype(int)                                    # already unit number + 1 (0 = none)
arr = {"cell0": ("i32", cell0), "crop": ("u8", crop), "ha": ("u8", ha), "adm1": ("u16", locnum(a1)), "adm2": ("u16", locnum(a2)),
       "adm3": ("u16", Z), "cbasin": ("u16", locnum(cb)), "csubbasin": ("u16", locnum(cs))}
for k in VK: arr["h_" + k] = ("i16", mean_h[k])
write_bin(f"{OUT}/grid/TST/static.bin.gz", dict(kind="grid-static", iso3="TST", tag=None, n=int(n), ncol=NC, nrow=NR, xmin=X0, ymax=Y1, per_deg=PER, vars=VK, npd=4), arr)
for tg in TAGS:
    a = {f"p{p+1}_{k}": ("i16", mean_f[tg][p][k]) for p in range(4) for k in VK}
    write_bin(f"{OUT}/grid/TST/{tg}.bin.gz", dict(kind="grid-future", iso3="TST", tag=tg, n=int(n), ncol=NC, nrow=NR, xmin=X0, ymax=Y1, per_deg=PER, vars=VK, npd=4), a)

# ---------------------------------------------------------------- series
SEAS = {"P": np.array([.02, .03, .06, .11, .13, .14, .16, .15, .12, .06, .02, .01]),
        "PET": np.array([.09, .09, .1, .09, .08, .07, .07, .07, .08, .09, .09, .08])}
SEAS["GET"] = SEAS["P"]; SEAS["BET"] = SEAS["PET"]; SEAS["AET"] = SEAS["P"] * .5 + SEAS["PET"] * .5
for k in SEAS: SEAS[k] = SEAS[k] / SEAS[k].sum()
def series_arrays(tag):
    years = HY if tag == "hist" else FY
    src = hist if tag == "hist" else fut[tag]
    res = {}
    for g in ("AF", "TST"):
        for lv in LV_ORDER[g]:
            nu = NU[g][lv]; A = np.full((nu, 2, 5, len(years)), np.nan)
            for u in range(nu):
                m = unit_mask(g, lv, u) if lv != "continent" else np.ones(n, bool)
                for c in (0, 1):
                    for vi, k in enumerate(VK): A[u, c, vi, :] = agg_unit(m, c, src[k].astype(float))
            M_ = np.full((nu, 2, 5, len(years) * 12), np.nan)
            for vi, k in enumerate(VK):
                M_[:, :, vi, :] = (A[:, :, vi, :, None] * SEAS[k][None, None, None, None, :]).reshape(nu, 2, len(years) * 12)
            res[(g, lv)] = (np.round(A), np.round(M_))
    return years, res
def write_series(tag, years, res):
    for (g, lv), (A, Mo) in res.items():
        nu = A.shape[0]
        for freq, arr_, CH in (("annual", A, CH_A), ("monthly", Mo, CH_M)):
            for ci in range((nu + CH - 1) // CH):
                sub = arr_[ci * CH:(ci + 1) * CH]
                if np.isnan(sub).all(): continue
                nt = sub.shape[3]
                write_bin(f"{OUT}/ts/{tag}/{g}/{lv}.{freq[0]}{ci}.bin.gz",
                          dict(kind="series", freq=freq, tag=tag, group=g, level=lv, chunk=ci, first=ci * CH, nu=int(sub.shape[0]), ncrop=2, nvar=5, nt=int(nt), y0=years[0], y1=years[-1]),
                          {"d": ("i16", sub.reshape(-1))})
for tg in ["hist"] + TAGS:
    yrs, res = series_arrays(tg); write_series(tg, yrs, res)

# ---------------------------------------------------------------- risk histograms (same integer slots as slot_rainfed / slot_irrigated)
def slot_rf(GETf, BETf, GETh):
    s = np.zeros(len(GETf), int)
    nd = np.isnan(GETf) | np.isnan(BETf) | np.isnan(GETh); s[nd] = RF_NB + 1
    a = ~nd & (GETf >= GETh); s[a] = 0
    b = ~nd & (GETf < GETh); s[b] = 1 + np.minimum((BETf[b] // RF_BW).astype(int), RF_NB - 1)
    return s
def slot_ir(BETf, BETh):
    s = np.zeros(len(BETf), int)
    nd = np.isnan(BETf) | np.isnan(BETh); s[nd] = IR_NB + 2
    a = ~nd & (BETf <= BETh); s[a] = 0
    b = ~nd & (BETf > BETh) & (BETh == 0); s[b] = IR_NB + 1
    m = ~nd & (BETf > BETh) & (BETh > 0)
    s[m] = 1 + np.minimum((((BETf[m] - BETh[m]) * 100) // BETh[m]).astype(int), IR_NB - 1)
    return s
GETh = mean_h["GET"].astype(float); BETh = mean_h["BET"].astype(float)
for tg in TAGS:
    S_rf, S_ir = {}, {}
    for p in range(4):
        gf = mean_f[tg][p]["GET"].astype(float); bf = mean_f[tg][p]["BET"].astype(float)
        S_rf[p] = slot_rf(gf, bf, GETh); S_ir[p] = slot_ir(bf, BETh)
    for g in ("AF", "TST"):
        for lv in LV_ORDER[g]:
            nu = NU[g][lv]; R = np.zeros((nu, 4, LEN_RF + LEN_IR), np.int64)
            for u in range(nu):
                m = unit_mask(g, lv, u) if lv != "continent" else np.ones(n, bool)
                for p in range(4):
                    for i in np.where(m & (rf > 0))[0]: R[u, p, S_rf[p][i]] += rf[i]
                    for i in np.where(m & (ir > 0))[0]: R[u, p, LEN_RF + S_ir[p][i]] += ir[i]
            for ci in range((nu + CH_R - 1) // CH_R):
                sub = R[ci * CH_R:(ci + 1) * CH_R]
                if not (sub != 0).any(): continue
                write_bin(f"{OUT}/risk/{tg}/{g}/{lv}.{ci}.bin.gz",
                          dict(kind="risk", tag=tg, group=g, level=lv, chunk=ci, first=ci * CH_R, nu=int(sub.shape[0]), np=4, len_rf=LEN_RF, len_ir=LEN_IR, rf_bw=RF_BW, rf_nb=RF_NB, ir_nb=IR_NB),
                          {"h": ("i32", sub.reshape(-1))})

# ---------------------------------------------------------------- boundaries (rectangles in degrees)
def deg(c0, r0, c1, r1): return (X0 + c0 / PER, Y1 - r1 / PER, X0 + c1 / PER, Y1 - r0 / PER)
def rect(w, s, e, nn): return {"type": "Polygon", "coordinates": [[[round(w, 4), round(s, 4)], [round(e, 4), round(s, 4)], [round(e, 4), round(nn, 4)], [round(w, 4), round(nn, 4)], [round(w, 4), round(s, 4)]]]}
def fc(feats): return {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"i": i}, "geometry": g} for i, g in feats]}
def mask_box(m): return deg(cc[m].min(), rr[m].min(), cc[m].max() + 1, rr[m].max() + 1)
for g in ("AF", "TST"):
    for lv in LV_ORDER[g]:
        if lv == "continent": continue
        feats = []
        for u in range(NU[g][lv]):
            m = unit_mask(g, lv, u)
            if m.any(): feats.append((u, rect(*mask_box(m))))
            else:                                                       # a unit without crop still has a polygon elsewhere
                w = X0 + (6300 + 30 * u) / PER; feats.append((u, rect(w, 3.0, w + 0.2, 3.2)))
        gzjson(f"{OUT}/bnd/{g}/{lv}.json.gz", fc(feats))

# ---------------------------------------------------------------- manifest
manifest = {"version": 1, "generated": "fixture", "grid": {"ncol": NC, "nrow": NR, "xmin": X0, "ymax": Y1, "per_deg": PER},
  "crops": ["rainfed", "irrigated"], "vars": VK, "var_names": ["Rainfall", "PET", "AET (required)", "Green ET (available)", "Blue ET (required)"],
  "hist": {"y0": 2013, "y1": 2025}, "future": {"y0": 2015, "y1": 2100}, "periods": PERIODS, "scenarios": ["ssp126", "ssp245", "ssp585"], "gcms": ["ACCESS-CM2"],
  "tags": ["hist"] + TAGS, "chunk": {"annual": CH_A, "monthly": CH_M, "risk": CH_R},
  "risk": {"rf_bw": RF_BW, "rf_nb": RF_NB, "ir_nb": IR_NB, "len_rf": LEN_RF, "len_ir": LEN_IR, "defaults": {"t1": 100, "t2": 150, "t3": 250, "t4": 1.1, "t5": 1.25},
           "classes_rainfed": ["No risk", "Low", "Moderate", "High", "Very high"], "classes_irrigated": ["No risk", "Low", "Moderate", "High"]},
  "levels": {"AF": LV_ORDER["AF"]},
  "countries": [{"iso3": "TST", "name": "Testland", "idx": 0, "cells": int(n), "rf_ha": int(rf.sum()), "ir_ha": int(ir.sum()),
                 "bbox": [int(cc.min()), int(rr.min()), int(cc.max()) + 1, int(rr.max()) + 1], "levels": LV_ORDER["TST"]}],
  "files": {"units": "units/{group}.json", "grid_static": "grid/{iso3}/static.bin.gz", "grid_future": "grid/{iso3}/{tag}.bin.gz",
            "ts_annual": "ts/{tag}/{group}/{level}.a{chunk}.bin.gz", "ts_monthly": "ts/{tag}/{group}/{level}.m{chunk}.bin.gz",
            "risk": "risk/{tag}/{group}/{level}.{chunk}.bin.gz", "boundary": "bnd/{group}/{level}.json.gz"}}
wfile(f"{OUT}/manifest.json", json.dumps(manifest).encode())
print("fixture written to", OUT)
