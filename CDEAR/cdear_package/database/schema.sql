CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE spatial_units(
 id BIGSERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
 spatial_system TEXT NOT NULL CHECK(spatial_system IN ('administrative','hydrological')),
 level_code TEXT NOT NULL, parent_id BIGINT REFERENCES spatial_units(id), iso3 CHAR(3),
 area_km2 DOUBLE PRECISION, geom geometry(MultiPolygon,4326) NOT NULL);
CREATE INDEX spatial_units_geom_gix ON spatial_units USING GIST(geom);
CREATE INDEX spatial_units_parent_idx ON spatial_units(parent_id);

CREATE TABLE variables(id SMALLSERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,name TEXT NOT NULL,unit TEXT NOT NULL);
CREATE TABLE scenarios(id SMALLSERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,name TEXT NOT NULL,is_historical BOOLEAN DEFAULT FALSE);
CREATE TABLE climate_models(id SMALLSERIAL PRIMARY KEY,code TEXT UNIQUE NOT NULL,name TEXT NOT NULL,is_ensemble BOOLEAN DEFAULT FALSE);

CREATE TABLE regional_statistics(
 id BIGSERIAL PRIMARY KEY, spatial_unit_id BIGINT NOT NULL REFERENCES spatial_units(id),
 area_class TEXT NOT NULL CHECK(area_class IN ('whole_boundary','cropland','rainfed_cropland','irrigated_cropland')),
 variable_id SMALLINT NOT NULL REFERENCES variables(id), dataset_type TEXT NOT NULL CHECK(dataset_type IN ('historical','projected')),
 scenario_id SMALLINT NOT NULL REFERENCES scenarios(id), model_id SMALLINT NOT NULL REFERENCES climate_models(id),
 temporal_scale TEXT NOT NULL CHECK(temporal_scale IN ('monthly','annual')), year SMALLINT NOT NULL, month SMALLINT NOT NULL DEFAULT 0,
 value_mean DOUBLE PRECISION,value_sd DOUBLE PRECISION,value_min DOUBLE PRECISION,value_max DOUBLE PRECISION,
 p10 DOUBLE PRECISION,p50 DOUBLE PRECISION,p90 DOUBLE PRECISION,valid_area_km2 DOUBLE PRECISION,valid_pixel_count BIGINT,source_asset TEXT,
 UNIQUE(spatial_unit_id,area_class,variable_id,scenario_id,model_id,temporal_scale,year,month));
CREATE INDEX regional_stats_query_idx ON regional_statistics(spatial_unit_id,area_class,variable_id,scenario_id,model_id,temporal_scale,year,month);

CREATE TABLE period_summaries(
 id BIGSERIAL PRIMARY KEY,spatial_unit_id BIGINT REFERENCES spatial_units(id),area_class TEXT NOT NULL,
 variable_id SMALLINT REFERENCES variables(id),scenario_id SMALLINT REFERENCES scenarios(id),model_id SMALLINT REFERENCES climate_models(id),
 period_label TEXT NOT NULL,start_year SMALLINT,end_year SMALLINT,baseline_mean DOUBLE PRECISION,future_mean DOUBLE PRECISION,
 absolute_change DOUBLE PRECISION,percent_change DOUBLE PRECISION,ensemble_p10 DOUBLE PRECISION,ensemble_p90 DOUBLE PRECISION,
 model_agreement_pct DOUBLE PRECISION,
 UNIQUE(spatial_unit_id,area_class,variable_id,scenario_id,model_id,period_label));

CREATE TABLE recommendations(
 id BIGSERIAL PRIMARY KEY,spatial_unit_id BIGINT REFERENCES spatial_units(id),area_class TEXT,scenario_id SMALLINT REFERENCES scenarios(id),
 period_label TEXT,risk_level TEXT,confidence_level TEXT,evidence JSONB,recommendation_text TEXT,actions JSONB,method_version TEXT,created_at TIMESTAMPTZ DEFAULT now());

INSERT INTO variables(code,name,unit) VALUES
('rainfall','Rainfall','mm'),('pet','Potential evapotranspiration','mm'),('aet','Actual evapotranspiration','mm'),
('green_et','Green ET','mm'),('blue_et','Blue ET','mm'),('required_green_et','Required Green ET','mm') ON CONFLICT DO NOTHING;
INSERT INTO scenarios(code,name,is_historical) VALUES ('historical','Historical',TRUE),('SSP126','SSP1-2.6',FALSE),('SSP245','SSP2-4.5',FALSE),('SSP585','SSP5-8.5',FALSE) ON CONFLICT DO NOTHING;
INSERT INTO climate_models(code,name,is_ensemble) VALUES
('ensemble','Ensemble mean',TRUE),('ACCESS-ESM1-5','ACCESS-ESM1-5',FALSE),('CanESM5','CanESM5',FALSE),('CNRM-CM6-1','CNRM-CM6-1',FALSE),
('GFDL-ESM4','GFDL-ESM4',FALSE),('IPSL-CM6A-LR','IPSL-CM6A-LR',FALSE),('MIROC6','MIROC6',FALSE),('MPI-ESM1-2-HR','MPI-ESM1-2-HR',FALSE),('NorESM2-MM','NorESM2-MM',FALSE) ON CONFLICT DO NOTHING;
