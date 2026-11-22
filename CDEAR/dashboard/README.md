# CDEAR v24 - dashboard on the pre-computed data (D01-D05)

## Use
1. Put `CDEAR_v24.html` and the **`dashboard/`** folder written by `D05_write_dashboard_files.R` (`DASH_ROOT`) in the same folder.
   (Or keep the data elsewhere and open `CDEAR_v24.html?data=path/to/folder/`.)
2. Open it through a web server, not by double-click (browsers block `fetch` for local files):
   `python -m http.server 8000` in that folder, then `http://localhost:8000/CDEAR_v24.html`.
   GitHub Pages / any static host works the same way. Leaflet and the base maps load from the internet.
3. With data for ONE country the page opens in that country; with several it opens on Africa.

## What you see
* **Filters**: Region (Africa / country) · Show units (countries, basins, sub-basins at Africa level; admin 1-3, basins, sub-basins inside a country) ·
  optional single Unit · Crop type (rainfed / irrigated) · Scenario · Climate model · Future period · Basemap.
* **KPIs**: crop area of the selected type (+ the other type), rainfall / green ET / blue ET (period mean, baseline, change) and the share of crop area at risk.
* **Map**: *1-km crop grid* (country view only; every cell coloured by its risk class, selected unit highlighted, click a cell to select its unit,
  click a legend class to hide it) or *Unit summary* (one colour per unit; metric = risk shares, or change in rainfall / PET / green ET / blue ET).
  Africa level shows units only, never the grid.
* **Trends**: annual P, PET, required AET, available green ET, required blue ET - baseline 2013-2025 and projection to 2100 (10-year mean, shaded period);
  Monthly = mean seasonal cycle (baseline vs period) or the full monthly series. Table of baseline / period / change below.
* **Risk & thresholds**: t1-t5 inputs (t1-t3 in mm, t4-t5 ratios such as 1.10 / 1.25) with reset; stacked bars for the four periods; class table.
  Everything (map, KPIs, tables) follows the thresholds immediately. Values are snapped to the data resolution (5 mm, 0.01).
* **Units**: sortable table of every unit of the current level (crop area, class shares, share at Moderate or higher); click a row to select; CSV export.
* Export button (top right) = annual series CSV of the selected unit and crop type.

## Files in `dev/`
`src/` (page, style, `app.js`, `cdear_data.js`), `build.py` (assembles `CDEAR_v24.html`), `make_fixture.py` (writes a small test data folder in the exact
format of D05) and `test/` (runs the real page code in Node against that data: `python make_fixture.py fixture/data && python build.py && node test/run.js`).
