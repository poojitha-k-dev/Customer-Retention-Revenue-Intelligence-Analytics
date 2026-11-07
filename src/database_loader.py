"""Database loading module.

Creates PostgreSQL database `olist_db`, executes relational schema,
and bulk-loads cleaned CSV datasets using PostgreSQL COPY.
"""

import sys
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pandas as pd
from pathlib import Path

from src.config import (
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
    PROCESSED_DATA_DIR, SQL_DIR, logger
)

TABLE_FILE_MAP = [
    # Order matters due to foreign keys!
    ("geolocation", "geolocation_clean.csv"),
    ("customers", "customers_clean.csv"),
    ("products", "products_clean.csv"),
    ("sellers", "sellers_clean.csv"),
    ("orders", "orders_clean.csv"),
    ("order_items", "order_items_clean.csv"),
    ("payments", "payments_clean.csv"),
    ("reviews", "reviews_clean.csv")
]


def ensure_database_exists():
    """Ensure target database exists on PostgreSQL server."""
    logger.info(f"Connecting to PostgreSQL server at {DB_HOST}:{DB_PORT} as {DB_USER}...")
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
    exists = cursor.fetchone()
    if not exists:
        logger.info(f"Database '{DB_NAME}' does not exist. Creating...")
        cursor.execute(f'CREATE DATABASE "{DB_NAME}";')
        logger.info(f"Database '{DB_NAME}' created successfully.")
    else:
        logger.info(f"Database '{DB_NAME}' already exists.")
        
    cursor.close()
    conn.close()


def apply_schema():
    """Execute 01_schema.sql to build tables, constraints, and indexes."""
    schema_path = SQL_DIR / "01_schema.sql"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found at {schema_path}")
        
    logger.info(f"Applying schema from {schema_path.name} to {DB_NAME}...")
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    
    cursor.execute(schema_sql)
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("Schema applied successfully.")


def bulk_load_tables():
    """Load each cleaned CSV file into its PostgreSQL table."""
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()
    
    summary = {}
    for table_name, csv_filename in TABLE_FILE_MAP:
        csv_path = PROCESSED_DATA_DIR / csv_filename
        if not csv_path.exists():
            raise FileNotFoundError(f"Processed file {csv_path} does not exist.")
            
        logger.info(f"Bulk loading '{table_name}' from {csv_filename}...")
        
        # Read header to get exact column list
        with open(csv_path, "r", encoding="utf-8") as f:
            header_line = f.readline().strip()
            cols = [c.strip() for c in header_line.split(",")]
            
        cols_str = ", ".join([f'"{col}"' for col in cols])
        copy_sql = f"""
            COPY {table_name} ({cols_str})
            FROM STDIN WITH (FORMAT csv, HEADER true, NULL '');
        """
        
        with open(csv_path, "r", encoding="utf-8") as f:
            cursor.copy_expert(copy_sql, f)
            
        conn.commit()
        
        # Validate row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        row_count = cursor.fetchone()[0]
        summary[table_name] = row_count
        logger.info(f"Loaded {table_name}: {row_count:,} rows in database.")
        
    cursor.close()
    conn.close()
    return summary


def run_data_loader():
    """Run full database setup and loading workflow."""
    ensure_database_exists()
    apply_schema()
    summary = bulk_load_tables()
    logger.info("=" * 60)
    logger.info("PostgreSQL Database Loading Complete!")
    for table, count in summary.items():
        logger.info(f"  • {table:<20}: {count:>8,} rows")
    logger.info("=" * 60)
    return summary


if __name__ == "__main__":
    run_data_loader()

