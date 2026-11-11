"""FastAPI Integration Layer for Customer Retention & Revenue Intelligence Platform.

Exposes endpoints for pipeline execution, health checks, cohort retention reports,
RFM customer segmentation summaries, and n8n workflow triggers.
"""

import os
import sys
import time
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Security, Depends, status, BackgroundTasks
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field
import pandas as pd
import psycopg2

# Ensure project root in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.config import (
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
    PROCESSED_DATA_DIR, logger
)

# API Security configuration
API_KEY_NAME = "X-API-Key"
API_KEY = os.getenv("API_KEY", "olist_secret_token_2026")
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


def get_api_key(header_key: str = Security(api_key_header)):
    if header_key and header_key == API_KEY:
        return header_key
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid or missing API Key"
    )


# FastAPI Application instance
app = FastAPI(
    title="Customer Retention & Purchase Behaviour Intelligence API",
    description="Enterprise REST API exposing analytical pipelines, cohort retention metrics, and RFM segmentation data for n8n workflow automation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Global pipeline execution state
pipeline_state = {
    "status": "idle",
    "last_run_start": None,
    "last_run_end": None,
    "duration_seconds": None,
    "current_step": None,
    "error": None
}


# Pydantic Models
class PipelineRunRequest(BaseModel):
    force_download: bool = Field(False, description="Re-download raw datasets from source mirror")
    run_tests: bool = Field(True, description="Execute automated test suite after processing")


class PipelineStatusResponse(BaseModel):
    status: str
    last_run_start: Optional[str]
    last_run_end: Optional[str]
    duration_seconds: Optional[float]
    current_step: Optional[str]
    error: Optional[str]


class HealthResponse(BaseModel):
    status: str
    database: str
    data_marts_loaded: bool
    timestamp: str


class SummaryKPIs(BaseModel):
    total_gross_revenue: float
    total_delivered_orders: int
    total_unique_customers: int
    repeat_customers: int
    repeat_purchase_rate_pct: float
    repeat_revenue_contribution_pct: float
    average_order_value: float
    average_customer_revenue: float
    delayed_deliveries_pct: float
    on_time_avg_review_score: float
    delayed_avg_review_score: float


# Background worker for pipeline execution
def run_pipeline_worker(force_download: bool = False, run_tests: bool = True):
    global pipeline_state
    pipeline_state["status"] = "running"
    pipeline_state["last_run_start"] = datetime.utcnow().isoformat()
    pipeline_state["last_run_end"] = None
    pipeline_state["error"] = None
    start_time = time.time()
    
    try:
        from src.data_ingestion import ingest_all
        from src.data_cleaning import OlistDataCleaner
        from src.database_loader import run_data_loader
        from src.sql_runner import run_all_sql_analytics
        
        pipeline_state["current_step"] = "1/4 Data Ingestion"
        ingest_all(force_download=force_download)
        
        pipeline_state["current_step"] = "2/4 Data Cleaning & Validation"
        cleaner = OlistDataCleaner()
        cleaner.run_pipeline()
        
        pipeline_state["current_step"] = "3/4 Database Loading"
        run_data_loader()
        
        pipeline_state["current_step"] = "4/4 SQL Analytics & Mart Generation"
        run_all_sql_analytics()
        
        pipeline_state["status"] = "completed"
        pipeline_state["current_step"] = "Finished successfully"
    except Exception as e:
        logger.error(f"Pipeline execution error: {e}", exc_info=True)
        pipeline_state["status"] = "failed"
        pipeline_state["error"] = str(e)
    finally:
        pipeline_state["last_run_end"] = datetime.utcnow().isoformat()
        pipeline_state["duration_seconds"] = round(time.time() - start_time, 2)


# ---------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System Health"])
def get_health():
    """System health check and database connectivity probe."""
    db_status = "connected"
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
            host=DB_HOST, port=DB_PORT, connect_timeout=3
        )
        conn.close()
    except Exception as e:
        db_status = f"disconnected: {str(e)[:50]}"
        
    marts_exist = (PROCESSED_DATA_DIR / "mart_customer_rfm.csv").exists()
    
    return {
        "status": "healthy" if db_status == "connected" and marts_exist else "degraded",
        "database": db_status,
        "data_marts_loaded": marts_exist,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/pipeline/run", tags=["Pipeline Operations"])
def trigger_pipeline(
    req: PipelineRunRequest,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key)
):
    """Trigger the data pipeline asynchronously. Requires X-API-Key header."""
    global pipeline_state
    if pipeline_state["status"] == "running":
        raise HTTPException(
            status_code=409,
            detail="Pipeline execution is already in progress"
        )
        
    background_tasks.add_task(run_pipeline_worker, req.force_download, req.run_tests)
    return {
        "status": "initiated",
        "message": "Data pipeline execution dispatched in background",
        "started_at": datetime.utcnow().isoformat()
    }


@app.get("/pipeline/status", response_model=PipelineStatusResponse, tags=["Pipeline Operations"])
def get_pipeline_status():
    """Retrieve the current execution status and historical run metadata."""
    return pipeline_state


@app.get("/reports/summary", response_model=SummaryKPIs, tags=["Analytics Reports"])
def get_summary_kpis():
    """Get high-level executive KPIs including revenue, AOV, ARPU, and repeat purchase rates."""
    rfm_path = PROCESSED_DATA_DIR / "mart_customer_rfm.csv"
    orders_path = PROCESSED_DATA_DIR / "mart_orders_analytics.csv"
    
    if not rfm_path.exists() or not orders_path.exists():
        raise HTTPException(status_code=404, detail="Data marts not found. Please run data pipeline first.")
        
    rfm = pd.read_csv(rfm_path)
    orders = pd.read_csv(orders_path)
    delivered = orders[orders["order_status"] == "delivered"]
    
    total_rev = float(delivered["gross_order_value"].sum())
    total_orders = int(len(delivered))
    total_cust = int(len(rfm))
    repeat_cust = int((rfm["frequency"] > 1).sum())
    repeat_rev = float(rfm[rfm["frequency"] > 1]["monetary_value"].sum())
    
    delayed_orders = delivered[delivered["is_delayed"] == True]
    ontime_orders = delivered[delivered["is_delayed"] == False]
    
    return {
        "total_gross_revenue": round(total_rev, 2),
        "total_delivered_orders": total_orders,
        "total_unique_customers": total_cust,
        "repeat_customers": repeat_cust,
        "repeat_purchase_rate_pct": round((repeat_cust / total_cust * 100), 2),
        "repeat_revenue_contribution_pct": round((repeat_rev / total_rev * 100), 2),
        "average_order_value": round(total_rev / total_orders, 2),
        "average_customer_revenue": round(total_rev / total_cust, 2),
        "delayed_deliveries_pct": round(len(delayed_orders) / total_orders * 100, 2),
        "on_time_avg_review_score": round(float(ontime_orders["review_score"].mean()), 2),
        "delayed_avg_review_score": round(float(delayed_orders["review_score"].mean()), 2)
    }


@app.get("/reports/retention", tags=["Analytics Reports"])
def get_retention_report(cohort_month: Optional[str] = None):
    """Retrieve cohort retention rates across Month 0 to Month 12."""
    cohort_path = PROCESSED_DATA_DIR / "mart_cohort_retention.csv"
    if not cohort_path.exists():
        raise HTTPException(status_code=404, detail="Cohort retention mart not found.")
        
    df = pd.read_csv(cohort_path)
    if cohort_month:
        df = df[df["cohort_label"] == cohort_month]
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Cohort {cohort_month} not found.")
            
    # Platform-wide average decay by month index
    decay = df[df["cohort_index"] > 0].groupby("cohort_index")["retention_rate_pct"].mean().round(2).to_dict()
    
    cohorts_list = []
    for label, group in df.groupby("cohort_label"):
        size = int(group[group["cohort_index"] == 0]["cohort_size"].values[0])
        monthly_ret = group[["cohort_index", "active_customers", "retention_rate_pct", "cohort_revenue"]].to_dict(orient="records")
        cohorts_list.append({
            "cohort_label": label,
            "cohort_size": size,
            "retention_history": monthly_ret
        })
        
    return {
        "platform_average_decay_pct": decay,
        "cohorts_count": len(cohorts_list),
        "cohorts": cohorts_list
    }


@app.get("/reports/rfm", tags=["Analytics Reports"])
def get_rfm_report(segment: Optional[str] = None):
    """Retrieve RFM customer segmentation summary and economic distribution."""
    rfm_path = PROCESSED_DATA_DIR / "mart_customer_rfm.csv"
    if not rfm_path.exists():
        raise HTTPException(status_code=404, detail="RFM mart not found.")
        
    rfm = pd.read_csv(rfm_path)
    total_rev = rfm["monetary_value"].sum()
    total_cust = len(rfm)
    
    seg_summary = rfm.groupby("customer_segment").agg(
        customer_count=("customer_unique_id", "count"),
        total_revenue=("monetary_value", "sum"),
        avg_spend=("monetary_value", "mean"),
        avg_recency_days=("recency_days", "mean"),
        avg_frequency=("frequency", "mean")
    ).reset_index()
    
    seg_summary["customer_share_pct"] = (seg_summary["customer_count"] / total_cust * 100).round(2)
    seg_summary["revenue_share_pct"] = (seg_summary["total_revenue"] / total_rev * 100).round(2)
    seg_summary["total_revenue"] = seg_summary["total_revenue"].round(2)
    seg_summary["avg_spend"] = seg_summary["avg_spend"].round(2)
    seg_summary["avg_recency_days"] = seg_summary["avg_recency_days"].round(1)
    seg_summary["avg_frequency"] = seg_summary["avg_frequency"].round(2)
    
    if segment:
        seg_summary = seg_summary[seg_summary["customer_segment"].str.lower() == segment.lower()]
        if seg_summary.empty:
            raise HTTPException(status_code=404, detail=f"Segment '{segment}' not found.")
            
    return {
        "total_unique_customers": total_cust,
        "total_gross_revenue": round(total_rev, 2),
        "segments": seg_summary.sort_values(by="total_revenue", ascending=False).to_dict(orient="records")
    }


@app.get("/reports/categories", tags=["Analytics Reports"])
def get_category_report(limit: int = 15):
    """Retrieve top product categories by gross merchandise revenue."""
    cat_path = PROCESSED_DATA_DIR / "mart_category_performance.csv"
    if not cat_path.exists():
        raise HTTPException(status_code=404, detail="Category mart not found.")
        
    df = pd.read_csv(cat_path).sort_values(by="total_gross_revenue", ascending=False).head(limit)
    return {
        "categories_count": len(df),
        "categories": df.to_dict(orient="records")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api:app", host="127.0.0.1", port=8000, reload=True)

