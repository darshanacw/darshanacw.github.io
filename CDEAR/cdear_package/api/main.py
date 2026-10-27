from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from psycopg_pool import ConnectionPool
class Settings(BaseSettings):
    database_url:str
    cors_origins:str="http://localhost:5173"
    class Config: env_file=".env"
s=Settings(); pool=ConnectionPool(s.database_url); app=FastAPI(title="CDEAR API")
app.add_middleware(CORSMiddleware,allow_origins=s.cors_origins.split(','),allow_methods=['*'],allow_headers=['*'])
@app.get('/health')
def health(): return {'status':'ok'}
@app.get('/api/spatial-units')
def units(parent_code:str|None=None):
    sql="SELECT u.code,u.name,u.spatial_system,u.level_code FROM spatial_units u LEFT JOIN spatial_units p ON p.id=u.parent_id WHERE (%s IS NULL OR p.code=%s) ORDER BY u.name"
    with pool.connection() as c: rows=c.execute(sql,[parent_code,parent_code]).fetchall()
    return [dict(zip(['code','name','spatial_system','level_code'],r)) for r in rows]
@app.get('/api/timeseries')
def series(unit_code:str,variable:str,area_class:str,scenario:str,model:str,scale:str='annual'):
    sql="SELECT rs.year,rs.month,rs.value_mean,rs.value_sd,rs.p10,rs.p50,rs.p90 FROM regional_statistics rs JOIN spatial_units u ON u.id=rs.spatial_unit_id JOIN variables v ON v.id=rs.variable_id JOIN scenarios s ON s.id=rs.scenario_id JOIN climate_models m ON m.id=rs.model_id WHERE u.code=%s AND v.code=%s AND rs.area_class=%s AND s.code=%s AND m.code=%s AND rs.temporal_scale=%s ORDER BY rs.year,rs.month"
    with pool.connection() as c: rows=c.execute(sql,[unit_code,variable,area_class,scenario,model,scale]).fetchall()
    return [dict(zip(['year','month','mean','sd','p10','p50','p90'],r)) for r in rows]
@app.get('/api/summary')
def summary(unit_code:str,variable:str,area_class:str,scenario:str,model:str,period:str):
    sql="SELECT ps.baseline_mean,ps.future_mean,ps.percent_change,ps.ensemble_p10,ps.ensemble_p90,ps.model_agreement_pct FROM period_summaries ps JOIN spatial_units u ON u.id=ps.spatial_unit_id JOIN variables v ON v.id=ps.variable_id JOIN scenarios s ON s.id=ps.scenario_id JOIN climate_models m ON m.id=ps.model_id WHERE u.code=%s AND v.code=%s AND ps.area_class=%s AND s.code=%s AND m.code=%s AND ps.period_label=%s"
    with pool.connection() as c: row=c.execute(sql,[unit_code,variable,area_class,scenario,model,period]).fetchone()
    if not row: raise HTTPException(404,'Not found')
    return dict(zip(['baseline','future','change_pct','p10','p90','agreement_pct'],row))
