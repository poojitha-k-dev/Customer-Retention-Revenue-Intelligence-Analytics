"""Unit tests for RFM scoring and segmentation logic."""

import pytest
import pandas as pd
import numpy as np


def assign_test_segment(r_score, f_score, m_score):
    """Mirror RFM segmentation logic from SQL / analytical pipeline."""
    if r_score >= 4 and f_score >= 4:
        return "Champions"
    elif r_score >= 3 and f_score >= 3:
        return "Loyal Customers"
    elif r_score >= 4 and f_score in (1, 2) and m_score >= 3:
        return "Potential Loyalists"
    elif r_score >= 4 and f_score == 1:
        return "New Customers"
    elif r_score <= 2 and f_score >= 3:
        return "At Risk"
    elif r_score <= 2 and m_score >= 4:
        return "Cannot Lose Them"
    elif r_score == 2 and f_score <= 2:
        return "Hibernating"
    else:
        return "Lost Customers"


def test_rfm_segment_assignment():
    assert assign_test_segment(5, 5, 5) == "Champions"
    assert assign_test_segment(4, 4, 3) == "Champions"
    assert assign_test_segment(3, 3, 3) == "Loyal Customers"
    assert assign_test_segment(4, 1, 4) == "Potential Loyalists"
    assert assign_test_segment(5, 1, 1) == "New Customers"
    assert assign_test_segment(1, 3, 2) == "At Risk"
    assert assign_test_segment(2, 1, 5) == "Cannot Lose Them"
    assert assign_test_segment(2, 1, 2) == "Hibernating"
    assert assign_test_segment(1, 1, 1) == "Lost Customers"


def test_mart_rfm_integrity():
    """Verify production mart_customer_rfm.csv integrity and calculations."""
    df_rfm = pd.read_csv("data/processed/mart_customer_rfm.csv")
    
    assert len(df_rfm) > 90_000
    assert df_rfm["customer_unique_id"].is_unique
    assert (df_rfm["frequency"] >= 1).all()
    assert (df_rfm["monetary_value"] >= 0).all()
    assert (df_rfm["recency_days"] >= 0).all()
    
    # Check valid segment distribution
    expected_segments = {
        "Champions", "Loyal Customers", "Potential Loyalists", "New Customers",
        "At Risk", "Cannot Lose Them", "Hibernating", "Lost Customers"
    }
    actual_segments = set(df_rfm["customer_segment"].unique())
    assert actual_segments.issubset(expected_segments)

