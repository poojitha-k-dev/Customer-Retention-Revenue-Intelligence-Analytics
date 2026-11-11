"""Unit tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from src.api import app, API_KEY


@pytest.fixture
def client():
    return TestClient(app)


def test_get_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "data_marts_loaded" in data


def test_get_summary_kpis(client):
    response = client.get("/reports/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_unique_customers"] > 90_000
    assert data["total_delivered_orders"] > 90_000
    assert data["repeat_purchase_rate_pct"] == pytest.approx(3.00, abs=0.5)
    assert data["total_gross_revenue"] > 14_000_000.0


def test_get_retention_report(client):
    response = client.get("/reports/retention")
    assert response.status_code == 200
    data = response.json()
    assert "cohorts" in data
    assert "platform_average_decay_pct" in data
    assert len(data["cohorts"]) > 0


def test_get_rfm_report(client):
    response = client.get("/reports/rfm")
    assert response.status_code == 200
    data = response.json()
    assert "segments" in data
    assert len(data["segments"]) == 8


def test_get_rfm_filtered_segment(client):
    response = client.get("/reports/rfm?segment=Champions")
    assert response.status_code == 200
    data = response.json()
    assert len(data["segments"]) == 1
    assert data["segments"][0]["customer_segment"] == "Champions"


def test_get_category_report(client):
    response = client.get("/reports/categories?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["categories_count"] == 5
    assert len(data["categories"]) == 5


def test_trigger_pipeline_auth_failure(client):
    # Without X-API-Key header -> 403 Forbidden
    response = client.post("/pipeline/run", json={"force_download": False})
    assert response.status_code == 403

    # With invalid key -> 403 Forbidden
    response = client.post("/pipeline/run", json={"force_download": False}, headers={"X-API-Key": "wrong_key"})
    assert response.status_code == 403


def test_pipeline_status(client):
    response = client.get("/pipeline/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

