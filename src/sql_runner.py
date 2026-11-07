"""SQL Runner & Analytical Mart Generator.

Executes all analytical SQL scripts against PostgreSQL database `olist_db`,
validates analytical queries, and exports business intelligence data marts to CSV.
"""

import sys
import psycopg2
import pandas as pd
from pathlib import Path

from src.config import (
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
    SQL_DIR, PROCESSED_DATA_DIR, logger
)


def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


def run_sql_file(file_path: Path):
    """Execute SQL file containing one or more statements."""
    logger.info(f"--- Running SQL File: {file_path.name} ---")
    conn = get_connection()
    cursor = conn.cursor()
    
    with open(file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()
        
    # Split queries by semicolon outside comments
    # Or execute statements block by block
    statements = [s.strip() for s in sql_content.split(";") if s.strip() and not s.strip().startswith("--")]
    
    for idx, stmt in enumerate(statements, 1):
        if not stmt:
            continue
        try:
            cursor.execute(stmt)
            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                df = pd.DataFrame(rows, columns=columns)
                logger.info(f"Query #{idx} executed successfully ({len(df)} rows returned):")
                # Print preview of first 5 rows
                print(df.head(5).to_string(index=False))
                print()
            else:
                conn.commit()
                logger.info(f"Statement #{idx} executed successfully.")
        except Exception as e:
            logger.error(f"Error executing statement #{idx} in {file_path.name}: {e}")
            raise
            
    cursor.close()
    conn.close()


def export_powerbi_marts():
    """Generate and export ready-to-use analytical data marts for Power BI."""
    logger.info("Generating Power BI analytical data marts...")
    conn = get_connection()
    
    # 1. Customer Summary & RFM Mart
    rfm_mart_sql = """
    WITH snapshot_date AS (
        SELECT MAX(order_purchase_timestamp)::DATE + INTERVAL '1 day' AS max_date
        FROM orders WHERE order_status = 'delivered'
    ),
    raw_rfm AS (
        SELECT
            c.customer_unique_id,
            MAX(c.customer_city) AS customer_city,
            MAX(c.customer_state) AS customer_state,
            MIN(o.order_purchase_timestamp) AS first_purchase_date,
            MAX(o.order_purchase_timestamp) AS last_purchase_date,
            ((SELECT max_date FROM snapshot_date)::DATE - MAX(o.order_purchase_timestamp)::DATE)::INT AS recency_days,
            COUNT(DISTINCT o.order_id) AS frequency,
            ROUND(SUM(oi.price), 2) AS total_items_spend,
            ROUND(SUM(oi.freight_value), 2) AS total_freight_spend,
            ROUND(SUM(oi.total_item_value), 2) AS monetary_value,
            ROUND(AVG(r.review_score), 2) AS avg_review_score,
            SUM(CASE WHEN o.is_delayed THEN 1 ELSE 0 END) AS delayed_orders_count
        FROM customers c
        INNER JOIN orders o ON c.customer_id = o.customer_id
        INNER JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN reviews r ON o.order_id = r.order_id
        WHERE o.order_status = 'delivered'
        GROUP BY c.customer_unique_id
    ),
    scored AS (
        SELECT
            *,
            NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score,
            CASE
                WHEN frequency >= 4 THEN 5
                WHEN frequency = 3 THEN 4
                WHEN frequency = 2 THEN 3
                WHEN frequency = 1 AND NTILE(5) OVER (ORDER BY monetary_value ASC) >= 4 THEN 2
                ELSE 1
            END AS f_score,
            NTILE(5) OVER (ORDER BY monetary_value ASC) AS m_score
        FROM raw_rfm
    )
    SELECT
        *,
        CONCAT(r_score, f_score, m_score) AS rfm_code,
        CASE
            WHEN r_score >= 4 AND f_score >= 4 THEN 'Champions'
            WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
            WHEN r_score >= 4 AND f_score IN (1, 2) AND m_score >= 3 THEN 'Potential Loyalists'
            WHEN r_score >= 4 AND f_score = 1 THEN 'New Customers'
            WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
            WHEN r_score <= 2 AND m_score >= 4 THEN 'Cannot Lose Them'
            WHEN r_score = 2 AND f_score <= 2 THEN 'Hibernating'
            ELSE 'Lost Customers'
        END AS customer_segment,
        CASE WHEN frequency > 1 THEN 'Repeat Customer' ELSE 'One-Time Customer' END AS customer_type
    FROM scored;
    """
    df_rfm = pd.read_sql_query(rfm_mart_sql, conn)
    rfm_path = PROCESSED_DATA_DIR / "mart_customer_rfm.csv"
    df_rfm.to_csv(rfm_path, index=False)
    logger.info(f"Saved {rfm_path.name} ({len(df_rfm):,} rows)")
    
    # 2. Cohort Retention Mart
    cohort_mart_sql = """
    WITH customer_first_order AS (
        SELECT
            c.customer_unique_id,
            DATE_TRUNC('month', MIN(o.order_purchase_timestamp))::DATE AS cohort_month
        FROM customers c
        INNER JOIN orders o ON c.customer_id = o.customer_id
        WHERE o.order_status = 'delivered'
        GROUP BY c.customer_unique_id
    ),
    customer_activities AS (
        SELECT
            c.customer_unique_id,
            cfo.cohort_month,
            DATE_TRUNC('month', o.order_purchase_timestamp)::DATE AS activity_month,
            (EXTRACT(YEAR FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(YEAR FROM cfo.cohort_month)) * 12 +
            (EXTRACT(MONTH FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(MONTH FROM cfo.cohort_month)) AS cohort_index,
            oi.total_item_value
        FROM customers c
        INNER JOIN orders o ON c.customer_id = o.customer_id
        INNER JOIN order_items oi ON o.order_id = oi.order_id
        INNER JOIN customer_first_order cfo ON c.customer_unique_id = cfo.customer_unique_id
        WHERE o.order_status = 'delivered'
    ),
    cohort_base AS (
        SELECT
            cohort_month,
            cohort_index,
            COUNT(DISTINCT customer_unique_id) AS active_customers,
            ROUND(SUM(total_item_value), 2) AS cohort_revenue
        FROM customer_activities
        GROUP BY cohort_month, cohort_index
    ),
    cohort_sizes AS (
        SELECT cohort_month, active_customers AS cohort_size
        FROM cohort_base WHERE cohort_index = 0
    )
    SELECT
        cb.cohort_month,
        TO_CHAR(cb.cohort_month, 'YYYY-MM') AS cohort_label,
        cs.cohort_size,
        cb.cohort_index,
        cb.active_customers,
        ROUND(cb.active_customers * 100.0 / cs.cohort_size, 2) AS retention_rate_pct,
        cb.cohort_revenue
    FROM cohort_base cb
    INNER JOIN cohort_sizes cs ON cb.cohort_month = cs.cohort_month
    ORDER BY cb.cohort_month, cb.cohort_index;
    """
    df_cohort = pd.read_sql_query(cohort_mart_sql, conn)
    cohort_path = PROCESSED_DATA_DIR / "mart_cohort_retention.csv"
    df_cohort.to_csv(cohort_path, index=False)
    logger.info(f"Saved {cohort_path.name} ({len(df_cohort):,} rows)")
    
    # 3. Orders Master Fact Mart (Enriched with Delivery, Review, Segment)
    orders_mart_sql = """
    WITH order_items_summary AS (
        SELECT
            order_id,
            COUNT(order_item_id) AS item_count,
            COUNT(DISTINCT product_id) AS unique_products,
            COUNT(DISTINCT seller_id) AS unique_sellers,
            ROUND(SUM(price), 2) AS items_value,
            ROUND(SUM(freight_value), 2) AS freight_value,
            ROUND(SUM(total_item_value), 2) AS gross_order_value
        FROM order_items
        GROUP BY order_id
    ),
    order_payment_summary AS (
        SELECT
            order_id,
            STRING_AGG(DISTINCT payment_type, ', ') AS payment_methods,
            MAX(payment_installments) AS max_installments,
            ROUND(SUM(payment_value), 2) AS payment_value
        FROM payments
        GROUP BY order_id
    )
    SELECT
        o.order_id,
        c.customer_unique_id,
        c.customer_city,
        c.customer_state,
        o.order_status,
        o.order_purchase_timestamp,
        o.purchase_year,
        o.purchase_month,
        o.purchase_year_month,
        o.purchase_day_name,
        o.purchase_hour,
        o.order_delivered_customer_date,
        o.order_estimated_delivery_date,
        o.delivery_duration_days,
        o.delivery_delay_days,
        o.is_delayed,
        r.review_score,
        COALESCE(ois.item_count, 0) AS item_count,
        COALESCE(ois.items_value, 0) AS items_value,
        COALESCE(ois.freight_value, 0) AS freight_value,
        COALESCE(ois.gross_order_value, 0) AS gross_order_value,
        ops.payment_methods,
        ops.max_installments,
        ops.payment_value
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items_summary ois ON o.order_id = ois.order_id
    LEFT JOIN order_payment_summary ops ON o.order_id = ops.order_id
    LEFT JOIN reviews r ON o.order_id = r.order_id;
    """
    df_orders_mart = pd.read_sql_query(orders_mart_sql, conn)
    orders_path = PROCESSED_DATA_DIR / "mart_orders_analytics.csv"
    df_orders_mart.to_csv(orders_path, index=False)
    logger.info(f"Saved {orders_path.name} ({len(df_orders_mart):,} rows)")
    
    # 4. Product Category Performance Mart
    category_mart_sql = """
    SELECT
        p.product_category_name_english AS category,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(oi.order_item_id) AS total_units_sold,
        ROUND(SUM(oi.price), 2) AS total_merchandise_revenue,
        ROUND(SUM(oi.freight_value), 2) AS total_freight_revenue,
        ROUND(SUM(oi.total_item_value), 2) AS total_gross_revenue,
        ROUND(AVG(oi.price), 2) AS avg_item_price,
        ROUND(AVG(r.review_score), 2) AS avg_review_score,
        ROUND(AVG(o.delivery_duration_days), 1) AS avg_delivery_days,
        ROUND(SUM(CASE WHEN o.is_delayed THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT o.order_id), 2) AS delay_rate_pct
    FROM orders o
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY p.product_category_name_english
    ORDER BY total_gross_revenue DESC;
    """
    df_cat = pd.read_sql_query(category_mart_sql, conn)
    cat_path = PROCESSED_DATA_DIR / "mart_category_performance.csv"
    df_cat.to_csv(cat_path, index=False)
    logger.info(f"Saved {cat_path.name} ({len(df_cat):,} rows)")
    
    conn.close()
    logger.info("All Power BI analytical marts exported successfully!")


def run_all_sql_analytics():
    """Execute all SQL analytical scripts in order."""
    sql_files = [
        "02_data_quality.sql",
        "03_customer_analysis.sql",
        "04_cohort_analysis.sql",
        "05_rfm_analysis.sql",
        "06_revenue_analysis.sql",
        "07_customer_experience.sql"
    ]
    for sf in sql_files:
        run_sql_file(SQL_DIR / sf)
        
    export_powerbi_marts()


if __name__ == "__main__":
    run_all_sql_analytics()
