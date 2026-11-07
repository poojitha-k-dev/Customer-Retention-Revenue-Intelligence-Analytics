"""Data validation module.

Validates schema conformity, null constraints, value ranges, and relationship integrity
across the Olist dataset.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
import logging

from src.config import logger


class DataValidator:
    """Validates tabular datasets against business rules and integrity constraints."""

    def __init__(self):
        self.validation_results: List[Dict[str, Any]] = []

    def log_result(self, check_name: str, table_name: str, passed: bool, details: str):
        record = {
            "check": check_name,
            "table": table_name,
            "passed": passed,
            "details": details
        }
        self.validation_results.append(record)
        log_fn = logger.info if passed else logger.warning
        status_str = "PASS" if passed else "FAIL"
        log_fn(f"[{status_str}] {table_name} - {check_name}: {details}")

    def validate_non_empty(self, df: pd.DataFrame, table_name: str) -> bool:
        passed = bool(df is not None and len(df) > 0)
        self.log_result("non_empty", table_name, passed, f"Row count = {len(df) if df is not None else 0}")
        return passed

    def validate_unique_primary_key(self, df: pd.DataFrame, table_name: str, key_columns: List[str]) -> bool:
        if isinstance(key_columns, str):
            key_columns = [key_columns]
        duplicates = int(df.duplicated(subset=key_columns).sum())
        passed = bool(duplicates == 0)
        self.log_result("unique_primary_key", table_name, passed,
                        f"Keys {key_columns}: {duplicates} duplicates found")
        return passed

    def validate_null_threshold(self, df: pd.DataFrame, table_name: str, column: str, max_null_pct: float = 0.0) -> bool:
        null_count = int(df[column].isna().sum())
        null_pct = float((null_count / len(df)) * 100 if len(df) > 0 else 0)
        passed = bool(null_pct <= max_null_pct)
        self.log_result("null_threshold", table_name, passed,
                        f"Column '{column}': {null_count} nulls ({null_pct:.2f}% vs max allowed {max_null_pct}%)")
        return passed

    def validate_numeric_range(self, df: pd.DataFrame, table_name: str, column: str,
                               min_val: float = None, max_val: float = None) -> bool:
        series = df[column].dropna()
        passed = True
        violations = 0
        if min_val is not None:
            v_low = int((series < min_val).sum())
            if v_low > 0:
                passed = False
                violations += v_low
        if max_val is not None:
            v_high = int((series > max_val).sum())
            if v_high > 0:
                passed = False
                violations += v_high
        passed = bool(passed)
        self.log_result("numeric_range", table_name, passed,
                        f"Column '{column}' in [{min_val}, {max_val}]: {violations} violations")
        return passed

    def validate_foreign_key(self, child_df: pd.DataFrame, child_col: str,
                             parent_df: pd.DataFrame, parent_col: str,
                             child_table: str, parent_table: str) -> bool:
        parent_keys = set(parent_df[parent_col].dropna().unique())
        child_keys = child_df[child_col].dropna()
        orphans = int((~child_keys.isin(parent_keys)).sum())
        passed = bool(orphans == 0)
        self.log_result("foreign_key_integrity", f"{child_table}->{parent_table}", passed,
                        f"{child_col} -> {parent_col}: {orphans} orphaned records found")
        return passed

    def get_summary_report(self) -> pd.DataFrame:
        return pd.DataFrame(self.validation_results)
