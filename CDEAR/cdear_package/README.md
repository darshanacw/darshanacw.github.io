# CDEAR implementation starter

Contents:
- `frontend`: responsive React/Vite dashboard source
- `database`: PostgreSQL/PostGIS schema
- `api`: FastAPI query service
- `r-processing`: R zonal extraction and period-summary workflow

The dashboard reads regional aggregates only. The 1 km rasters are used offline to create summaries for whole boundaries, cropland, rainfed cropland, and irrigated cropland.

## Run
1. Create database: `psql -d cdear -f database/schema.sql`
2. API: `cd api && pip install -r requirements.txt && uvicorn main:app --reload`
3. Frontend: `cd frontend && npm install && npm run dev`
4. Edit `r-processing/config.yml`, then run `Rscript r-processing/extract_regional_statistics.R r-processing/config.yml`
