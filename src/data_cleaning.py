"""Data cleaning and preprocessing module for Olist Brazilian E-Commerce dataset.

Transforms raw CSV data into cleaned, normalized tables with derived business fields,
handling missing values, invalid types, and duplicate records.
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

from src.config import RAW_DATA_DIR, PROCESSED_DATA_DIR, logger
from src.data_validation import DataValidator


class OlistDataCleaner:
    """End-to-end cleaning and preprocessing pipeline for Olist data."""

    def __init__(self, raw_dir: Path = RAW_DATA_DIR, processed_dir: Path = PROCESSED_DATA_DIR):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.validator = DataValidator()
        self.processed_dir.mkdir(parents=True, exist_ok=True)

    def load_raw(self, filename: str) -> pd.DataFrame:
        """Load a raw CSV file safely."""
        path = self.raw_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Raw file {path} not found. Please run data ingestion first.")
        logger.info(f"Loading raw file: {filename}")
        return pd.read_csv(path)

    def clean_customers(self) -> pd.DataFrame:
        """Clean customer table."""
        logger.info("Cleaning customers dataset...")
        df = self.load_raw("olist_customers_dataset.csv")
        
        # Deduplicate exact rows
        df = df.drop_duplicates()
        
        # Strip text fields
        df["customer_id"] = df["customer_id"].astype(str).str.strip()
        df["customer_unique_id"] = df["customer_unique_id"].astype(str).str.strip()
        df["customer_city"] = df["customer_city"].astype(str).str.strip().str.title()
        df["customer_state"] = df["customer_state"].astype(str).str.strip().str.upper()
        df["customer_zip_code_prefix"] = pd.to_numeric(df["customer_zip_code_prefix"], errors="coerce").fillna(0).astype(int)
        
        # Validation
        self.validator.validate_non_empty(df, "customers")
        self.validator.validate_unique_primary_key(df, "customers", ["customer_id"])
        self.validator.validate_null_threshold(df, "customers", "customer_unique_id", 0.0)
        
        return df

    def clean_orders(self) -> pd.DataFrame:
        """Clean orders table and engineer delivery metrics."""
        logger.info("Cleaning orders dataset...")
        df = self.load_raw("olist_orders_dataset.csv")
        
        df = df.drop_duplicates(subset=["order_id"])
        df["order_id"] = df["order_id"].astype(str).str.strip()
        df["customer_id"] = df["customer_id"].astype(str).str.strip()
        df["order_status"] = df["order_status"].astype(str).str.strip().str.lower()
        
        # Parse datetime fields
        date_cols = [
            "order_purchase_timestamp",
            "order_approved_at",
            "order_delivered_carrier_date",
            "order_delivered_customer_date",
            "order_estimated_delivery_date"
        ]
        for col in date_cols:
            df[col] = pd.to_datetime(df[col], errors="coerce")
            
        # Business date calculations
        df["purchase_year"] = df["order_purchase_timestamp"].dt.year
        df["purchase_month"] = df["order_purchase_timestamp"].dt.month
        df["purchase_year_month"] = df["order_purchase_timestamp"].dt.to_period("M").astype(str)
        df["purchase_day_name"] = df["order_purchase_timestamp"].dt.day_name()
        df["purchase_hour"] = df["order_purchase_timestamp"].dt.hour
        
        # Delivery durations (days)
        df["delivery_duration_days"] = (
            (df["order_delivered_customer_date"] - df["order_purchase_timestamp"]).dt.total_seconds() / 86400.0
        ).round(2)
        
        df["estimated_duration_days"] = (
            (df["order_estimated_delivery_date"] - df["order_purchase_timestamp"]).dt.total_seconds() / 86400.0
        ).round(2)
        
        # Delay calculation: positive means delivered AFTER estimated date
        df["delivery_delay_days"] = (
            (df["order_delivered_customer_date"] - df["order_estimated_delivery_date"]).dt.total_seconds() / 86400.0
        ).round(2)
        
        df["is_delayed"] = np.where(
            df["order_delivered_customer_date"].isna(),
            False,
            df["order_delivered_customer_date"] > df["order_estimated_delivery_date"]
        )
        
        self.validator.validate_non_empty(df, "orders")
        self.validator.validate_unique_primary_key(df, "orders", ["order_id"])
        self.validator.validate_null_threshold(df, "orders", "order_purchase_timestamp", 0.0)
        
        return df

    def clean_order_items(self) -> pd.DataFrame:
        """Clean order items table."""
        logger.info("Cleaning order items dataset...")
        df = self.load_raw("olist_order_items_dataset.csv")
        
        df["order_id"] = df["order_id"].astype(str).str.strip()
        df["order_item_id"] = pd.to_numeric(df["order_item_id"], errors="coerce").astype(int)
        df["product_id"] = df["product_id"].astype(str).str.strip()
        df["seller_id"] = df["seller_id"].astype(str).str.strip()
        df["shipping_limit_date"] = pd.to_datetime(df["shipping_limit_date"], errors="coerce")
        df["price"] = pd.to_numeric(df["price"], errors="coerce").round(2)
        df["freight_value"] = pd.to_numeric(df["freight_value"], errors="coerce").round(2)
        df["total_item_value"] = (df["price"] + df["freight_value"]).round(2)
        
        # Drop duplicates on composite PK
        df = df.drop_duplicates(subset=["order_id", "order_item_id"])
        
        self.validator.validate_non_empty(df, "order_items")
        self.validator.validate_unique_primary_key(df, "order_items", ["order_id", "order_item_id"])
        self.validator.validate_numeric_range(df, "order_items", "price", min_val=0.0)
        self.validator.validate_numeric_range(df, "order_items", "freight_value", min_val=0.0)
        
        return df

    def clean_payments(self) -> pd.DataFrame:
        """Clean order payments table."""
        logger.info("Cleaning payments dataset...")
        df = self.load_raw("olist_order_payments_dataset.csv")
        
        df["order_id"] = df["order_id"].astype(str).str.strip()
        df["payment_sequential"] = pd.to_numeric(df["payment_sequential"], errors="coerce").astype(int)
        df["payment_type"] = df["payment_type"].astype(str).str.strip().str.lower()
        df["payment_type"] = df["payment_type"].replace({"not_defined": "unknown"})
        df["payment_installments"] = pd.to_numeric(df["payment_installments"], errors="coerce").fillna(1).astype(int)
        df["payment_value"] = pd.to_numeric(df["payment_value"], errors="coerce").round(2)
        
        # Deduplicate
        df = df.drop_duplicates(subset=["order_id", "payment_sequential"])
        
        self.validator.validate_non_empty(df, "payments")
        self.validator.validate_unique_primary_key(df, "payments", ["order_id", "payment_sequential"])
        self.validator.validate_numeric_range(df, "payments", "payment_value", min_val=0.0)
        
        return df

    def clean_reviews(self) -> pd.DataFrame:
        """Clean order reviews table and deduplicate."""
        logger.info("Cleaning reviews dataset...")
        df = self.load_raw("olist_order_reviews_dataset.csv")
        
        df["review_id"] = df["review_id"].astype(str).str.strip()
        df["order_id"] = df["order_id"].astype(str).str.strip()
        df["review_score"] = pd.to_numeric(df["review_score"], errors="coerce").astype(int)
        df["review_creation_date"] = pd.to_datetime(df["review_creation_date"], errors="coerce")
        df["review_answer_timestamp"] = pd.to_datetime(df["review_answer_timestamp"], errors="coerce")
        df["review_comment_title"] = df["review_comment_title"].fillna("").astype(str).str.strip()
        df["review_comment_message"] = df["review_comment_message"].fillna("").astype(str).str.strip()
        
        # Deduplicate keeping the latest review per order
        df = df.sort_values(by=["order_id", "review_answer_timestamp"], ascending=[True, False])
        df = df.drop_duplicates(subset=["order_id"], keep="first")
        
        self.validator.validate_non_empty(df, "reviews")
        self.validator.validate_unique_primary_key(df, "reviews", ["order_id"])
        self.validator.validate_numeric_range(df, "reviews", "review_score", min_val=1, max_val=5)
        
        return df

    def clean_products(self) -> pd.DataFrame:
        """Clean products table and enrich with English category translation."""
        logger.info("Cleaning products dataset...")
        df_prod = self.load_raw("olist_products_dataset.csv")
        df_trans = self.load_raw("product_category_name_translation.csv")
        
        df_prod["product_id"] = df_prod["product_id"].astype(str).str.strip()
        df_prod = df_prod.drop_duplicates(subset=["product_id"])
        
        # Strip categories
        df_prod["product_category_name"] = df_prod["product_category_name"].astype(str).str.strip()
        df_trans["product_category_name"] = df_trans["product_category_name"].astype(str).str.strip()
        df_trans["product_category_name_english"] = df_trans["product_category_name_english"].astype(str).str.strip()
        
        # Merge translation
        df = df_prod.merge(df_trans, on="product_category_name", how="left")
        
        # Handle missing or untranslated categories
        df["product_category_name"] = df["product_category_name"].replace({"nan": "uncategorized"})
        df["product_category_name_english"] = df["product_category_name_english"].fillna(df["product_category_name"])
        df["product_category_name_english"] = df["product_category_name_english"].replace({"nan": "uncategorized"})
        df["product_category_name_english"] = df["product_category_name_english"].str.replace("_", " ").str.title()
        
        # Numeric dimensions
        num_cols = ["product_name_lenght", "product_description_lenght", "product_photos_qty",
                    "product_weight_g", "product_length_cm", "product_height_cm", "product_width_cm"]
        for c in num_cols:
            df[c] = pd.to_numeric(df[c], errors="coerce")
            
        self.validator.validate_non_empty(df, "products")
        self.validator.validate_unique_primary_key(df, "products", ["product_id"])
        
        return df

    def clean_sellers(self) -> pd.DataFrame:
        """Clean sellers dataset."""
        logger.info("Cleaning sellers dataset...")
        df = self.load_raw("olist_sellers_dataset.csv")
        
        df["seller_id"] = df["seller_id"].astype(str).str.strip()
        df = df.drop_duplicates(subset=["seller_id"])
        df["seller_city"] = df["seller_city"].astype(str).str.strip().str.title()
        df["seller_state"] = df["seller_state"].astype(str).str.strip().str.upper()
        df["seller_zip_code_prefix"] = pd.to_numeric(df["seller_zip_code_prefix"], errors="coerce").fillna(0).astype(int)
        
        self.validator.validate_non_empty(df, "sellers")
        self.validator.validate_unique_primary_key(df, "sellers", ["seller_id"])
        
        return df

    def clean_geolocation(self) -> pd.DataFrame:
        """Clean geolocation by aggregating to unique zip code prefixes."""
        logger.info("Cleaning and aggregating geolocation dataset...")
        df = self.load_raw("olist_geolocation_dataset.csv")
        
        df["geolocation_zip_code_prefix"] = pd.to_numeric(df["geolocation_zip_code_prefix"], errors="coerce").fillna(0).astype(int)
        df["geolocation_lat"] = pd.to_numeric(df["geolocation_lat"], errors="coerce")
        df["geolocation_lng"] = pd.to_numeric(df["geolocation_lng"], errors="coerce")
        
        # Filter realistic coordinate bounds for Brazil: lat between -34 and +6, lng between -74 and -34
        valid_coords = (
            (df["geolocation_lat"] >= -35.0) & (df["geolocation_lat"] <= 6.0) &
            (df["geolocation_lng"] >= -75.0) & (df["geolocation_lng"] <= -34.0)
        )
        df = df[valid_coords]
        
        # Aggregate by zip code prefix: mean lat/lng, mode city and state
        agg_geo = df.groupby("geolocation_zip_code_prefix").agg(
            latitude=("geolocation_lat", "mean"),
            longitude=("geolocation_lng", "mean"),
            city=("geolocation_city", lambda x: x.mode()[0] if not x.empty else ""),
            state=("geolocation_state", lambda x: x.mode()[0] if not x.empty else "")
        ).reset_index()
        
        agg_geo["latitude"] = agg_geo["latitude"].round(6)
        agg_geo["longitude"] = agg_geo["longitude"].round(6)
        agg_geo["city"] = agg_geo["city"].astype(str).str.strip().str.title()
        agg_geo["state"] = agg_geo["state"].astype(str).str.strip().str.upper()
        
        self.validator.validate_non_empty(agg_geo, "geolocation_aggregated")
        self.validator.validate_unique_primary_key(agg_geo, "geolocation_aggregated", ["geolocation_zip_code_prefix"])
        
        return agg_geo

    def run_pipeline(self) -> dict:
        """Execute full cleaning pipeline and save processed files."""
        logger.info("Starting Olist data cleaning pipeline...")
        
        customers = self.clean_customers()
        orders = self.clean_orders()
        order_items = self.clean_order_items()
        payments = self.clean_payments()
        reviews = self.clean_reviews()
        products = self.clean_products()
        sellers = self.clean_sellers()
        geolocation = self.clean_geolocation()
        
        # Validate foreign keys
        self.validator.validate_foreign_key(orders, "customer_id", customers, "customer_id", "orders", "customers")
        self.validator.validate_foreign_key(order_items, "order_id", orders, "order_id", "order_items", "orders")
        self.validator.validate_foreign_key(order_items, "product_id", products, "product_id", "order_items", "products")
        self.validator.validate_foreign_key(order_items, "seller_id", sellers, "seller_id", "order_items", "sellers")
        self.validator.validate_foreign_key(payments, "order_id", orders, "order_id", "payments", "orders")
        self.validator.validate_foreign_key(reviews, "order_id", orders, "order_id", "reviews", "orders")
        
        # Save processed CSVs
        cleaned_dfs = {
            "customers_clean.csv": customers,
            "orders_clean.csv": orders,
            "order_items_clean.csv": order_items,
            "payments_clean.csv": payments,
            "reviews_clean.csv": reviews,
            "products_clean.csv": products,
            "sellers_clean.csv": sellers,
            "geolocation_clean.csv": geolocation
        }
        
        for fname, df in cleaned_dfs.items():
            out_path = self.processed_dir / fname
            df.to_csv(out_path, index=False)
            logger.info(f"Saved processed file: {fname} ({len(df):,} rows)")
            
        # Save validation report
        val_df = self.validator.get_summary_report()
        val_path = self.processed_dir / "data_validation_report.csv"
        val_df.to_csv(val_path, index=False)
        logger.info(f"Saved validation report to {val_path}")
        
        return cleaned_dfs


if __name__ == "__main__":
    cleaner = OlistDataCleaner()
    cleaner.run_pipeline()

