"""Phase 1 Dataset Verification Script.

Inspects all 9 CSV files in data/raw/, validates file presence, sizes,
reads row counts and column headers, and confirms data usability.
"""

from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"

EXPECTED_FILES = {
    "olist_customers_dataset.csv": {
        "min_rows": 99_000,
        "key_cols": ["customer_id", "customer_unique_id", "customer_state"]
    },
    "olist_orders_dataset.csv": {
        "min_rows": 99_000,
        "key_cols": ["order_id", "customer_id", "order_status", "order_purchase_timestamp"]
    },
    "olist_order_items_dataset.csv": {
        "min_rows": 110_000,
        "key_cols": ["order_id", "order_item_id", "product_id", "seller_id", "price"]
    },
    "olist_order_payments_dataset.csv": {
        "min_rows": 100_000,
        "key_cols": ["order_id", "payment_sequential", "payment_type", "payment_value"]
    },
    "olist_order_reviews_dataset.csv": {
        "min_rows": 98_000,
        "key_cols": ["review_id", "order_id", "review_score"]
    },
    "olist_products_dataset.csv": {
        "min_rows": 32_000,
        "key_cols": ["product_id", "product_category_name"]
    },
    "olist_sellers_dataset.csv": {
        "min_rows": 3_000,
        "key_cols": ["seller_id", "seller_state"]
    },
    "olist_geolocation_dataset.csv": {
        "min_rows": 1_000_000,
        "key_cols": ["geolocation_zip_code_prefix", "geolocation_lat", "geolocation_lng"]
    },
    "product_category_name_translation.csv": {
        "min_rows": 70,
        "key_cols": ["product_category_name", "product_category_name_english"]
    }
}


def verify_dataset():
    print("=" * 80)
    print("PHASE 1: DATASET VERIFICATION & INTEGRITY AUDIT")
    print("=" * 80)
    
    results = []
    all_passed = True
    
    for filename, meta in EXPECTED_FILES.items():
        filepath = RAW_DIR / filename
        if not filepath.exists():
            print(f"[FAIL] Missing file: {filename}")
            all_passed = False
            continue
            
        size_bytes = filepath.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        
        try:
            # Read first 5 rows for column check and get total lines
            df_sample = pd.read_csv(filepath, nrows=5)
            # Count total rows
            row_count = sum(1 for _ in open(filepath, "r", encoding="utf-8", errors="ignore")) - 1
            
            missing_cols = [c for c in meta["key_cols"] if c not in df_sample.columns]
            status = "PASS" if len(missing_cols) == 0 and row_count >= meta["min_rows"] else "WARN"
            if status != "PASS":
                all_passed = False
                
            results.append({
                "File": filename,
                "Size (MB)": round(size_mb, 2),
                "Rows": row_count,
                "Cols": len(df_sample.columns),
                "Key Columns": ", ".join(meta["key_cols"][:3]),
                "Status": status
            })
        except Exception as e:
            results.append({
                "File": filename,
                "Size (MB)": round(size_mb, 2),
                "Rows": "ERROR",
                "Cols": "ERROR",
                "Key Columns": str(e)[:30],
                "Status": "FAIL"
            })
            all_passed = False
            
    df_res = pd.DataFrame(results)
    print(df_res.to_string(index=False))
    print("=" * 80)
    
    if all_passed:
        print("[SUCCESS] All 9 dataset files are intact, non-empty, and fully usable.")
    else:
        print("[WARNING] One or more files need attention.")
    return all_passed


if __name__ == "__main__":
    verify_dataset()

