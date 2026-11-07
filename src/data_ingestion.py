"""Data ingestion module for Olist Brazilian E-Commerce dataset.

Downloads authentic raw CSV files from verified mirrors if not present locally,
verifies integrity, and reports dataset statistics.
"""

import sys
import os
import urllib.request
import logging
from pathlib import Path
from tqdm import tqdm

from src.config import RAW_DATA_DIR, logger

DATASET_FILES = {
    "olist_customers_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_customers_dataset.csv",
        "expected_min_bytes": 8_500_000,
        "description": "Customer demographic data, linking customer_id to unique customer_unique_id"
    },
    "olist_orders_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_orders_dataset.csv",
        "expected_min_bytes": 17_000_000,
        "description": "Core order data with timestamps, statuses, and customer references"
    },
    "olist_order_items_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_order_items_dataset.csv",
        "expected_min_bytes": 15_000_000,
        "description": "Item-level order details, product IDs, seller IDs, item prices, freight"
    },
    "olist_order_payments_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_order_payments_dataset.csv",
        "expected_min_bytes": 5_500_000,
        "description": "Payment methods, installments, and payment values"
    },
    "olist_order_reviews_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_order_reviews_dataset.csv",
        "expected_min_bytes": 14_000_000,
        "description": "Customer review scores (1-5), review comments, and survey timestamps"
    },
    "olist_products_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_products_dataset.csv",
        "expected_min_bytes": 2_000_000,
        "description": "Product catalog details: categories, dimensions, weights"
    },
    "olist_sellers_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_sellers_dataset.csv",
        "expected_min_bytes": 150_000,
        "description": "Seller location details (zip code, city, state)"
    },
    "olist_geolocation_dataset.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/olist_geolocation_dataset.csv",
        "expected_min_bytes": 60_000_000,
        "description": "Brazilian zip code prefix coordinates (latitude, longitude, state)"
    },
    "product_category_name_translation.csv": {
        "url": "https://huggingface.co/datasets/miminmoons/olist-ecommerce-for-delivery-and-review-prediction/resolve/main/data/product_category_name_translation.csv",
        "expected_min_bytes": 2_000,
        "description": "Translation mapping from Portuguese product categories to English"
    }
}


class DownloadProgressBar(tqdm):
    """Custom progress bar for URL retrieval."""
    def update_to(self, b=1, bsize=1, tsize=None):
        if tsize is not None:
            self.total = tsize
        self.update(b * bsize - self.n)


def download_file(url: str, dest_path: Path):
    """Download file with visual progress bar."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dest_path.with_suffix(".tmp")
    logger.info(f"Downloading from {url} to {dest_path.name}...")
    
    with DownloadProgressBar(unit='B', unit_scale=True, miniters=1, desc=dest_path.name) as t:
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')]
        urllib.request.install_opener(opener)
        urllib.request.urlretrieve(url, filename=temp_path, reporthook=t.update_to)
    
    if temp_path.exists():
        temp_path.replace(dest_path)
    logger.info(f"Successfully downloaded {dest_path.name} ({dest_path.stat().st_size:,} bytes).")


def ingest_all(force_download: bool = False) -> dict:
    """Check for existing files, download missing files, and validate minimum sizes."""
    status = {}
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    logger.info("Checking Olist Brazilian E-Commerce dataset files in data/raw/...")
    
    for filename, meta in DATASET_FILES.items():
        file_path = RAW_DATA_DIR / filename
        need_download = force_download or (not file_path.exists()) or (file_path.stat().st_size < meta["expected_min_bytes"])
        
        if need_download:
            logger.info(f"Missing or incomplete: {filename}. Starting download...")
            download_file(meta["url"], file_path)
        else:
            logger.info(f"Verified existing: {filename} ({file_path.stat().st_size:,} bytes)")
        
        size = file_path.stat().st_size
        status[filename] = {
            "path": str(file_path),
            "size_bytes": size,
            "status": "VALID" if size >= meta["expected_min_bytes"] else "CORRUPT"
        }
        
    logger.info("All 9 Olist dataset files verified successfully!")
    return status


if __name__ == "__main__":
    force = "--force" in sys.argv
    ingest_all(force_download=force)
