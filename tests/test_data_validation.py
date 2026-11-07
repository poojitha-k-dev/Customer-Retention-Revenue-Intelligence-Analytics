"""Unit tests for DataValidator."""

import pytest
import pandas as pd
import numpy as np
from src.data_validation import DataValidator


@pytest.fixture
def sample_df():
    return pd.DataFrame({
        "order_id": ["O1", "O2", "O3", "O4"],
        "customer_id": ["C1", "C2", "C3", "C4"],
        "price": [10.0, 25.5, 99.9, 0.0],
        "score": [1, 3, 5, 4]
    })


def test_validate_non_empty(sample_df):
    validator = DataValidator()
    assert validator.validate_non_empty(sample_df, "test_table") is True
    assert validator.validate_non_empty(pd.DataFrame(), "empty_table") is False


def test_validate_unique_primary_key(sample_df):
    validator = DataValidator()
    assert validator.validate_unique_primary_key(sample_df, "test_table", ["order_id"]) is True
    
    dup_df = pd.DataFrame({"order_id": ["O1", "O1", "O2"]})
    assert validator.validate_unique_primary_key(dup_df, "dup_table", ["order_id"]) is False


def test_validate_null_threshold():
    validator = DataValidator()
    df_nulls = pd.DataFrame({"col": [1, 2, None, 4]})
    # 1 null out of 4 is 25%
    assert validator.validate_null_threshold(df_nulls, "test", "col", max_null_pct=30.0) is True
    assert validator.validate_null_threshold(df_nulls, "test", "col", max_null_pct=10.0) is False


def test_validate_numeric_range(sample_df):
    validator = DataValidator()
    assert validator.validate_numeric_range(sample_df, "test", "price", min_val=0.0) is True
    assert validator.validate_numeric_range(sample_df, "test", "score", min_val=1, max_val=5) is True
    
    bad_df = pd.DataFrame({"val": [-1.0, 5.0, 10.0]})
    assert validator.validate_numeric_range(bad_df, "bad", "val", min_val=0.0) is False


def test_validate_foreign_key():
    validator = DataValidator()
    parent = pd.DataFrame({"id": ["P1", "P2", "P3"]})
    child_valid = pd.DataFrame({"parent_id": ["P1", "P2", "P1"]})
    child_invalid = pd.DataFrame({"parent_id": ["P1", "P999"]})
    
    assert validator.validate_foreign_key(child_valid, "parent_id", parent, "id", "c", "p") is True
    assert validator.validate_foreign_key(child_invalid, "parent_id", parent, "id", "c", "p") is False
