"""Unit tests for Cohort Retention calculations."""

import pytest
import pandas as pd
import numpy as np


def test_mart_cohort_retention():
    """Verify production mart_cohort_retention.csv mathematics."""
    df_cohort = pd.read_csv("data/processed/mart_cohort_retention.csv")
    
    assert len(df_cohort) > 0
    assert "cohort_month" in df_cohort.columns
    assert "cohort_index" in df_cohort.columns
    assert "retention_rate_pct" in df_cohort.columns
    
    # Month 0 retention must always be exactly 100.0%
    m0_records = df_cohort[df_cohort["cohort_index"] == 0]
    assert len(m0_records) > 0
    assert (m0_records["retention_rate_pct"] == 100.0).all()
    assert (m0_records["active_customers"] == m0_records["cohort_size"]).all()
    
    # Subsequent retention must be <= 100%
    subsequent = df_cohort[df_cohort["cohort_index"] > 0]
    assert (subsequent["retention_rate_pct"] <= 100.0).all()
    assert (subsequent["active_customers"] <= subsequent["cohort_size"]).all()
