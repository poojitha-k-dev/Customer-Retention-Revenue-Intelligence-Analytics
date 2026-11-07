-- ====================================================================
-- 04_cohort_analysis.sql
-- Monthly Customer Cohorts, Retention Rates, and Cohort Matrix
-- ====================================================================

-- 1. Identify Customer Cohort (First Purchase Month) and All Order Activity
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
    SELECT
        cohort_month,
        active_customers AS cohort_size
    FROM cohort_base
    WHERE cohort_index = 0
)
SELECT
    cb.cohort_month,
    cs.cohort_size,
    cb.cohort_index,
    cb.active_customers,
    ROUND(cb.active_customers * 100.0 / cs.cohort_size, 2) AS retention_rate_pct,
    cb.cohort_revenue
FROM cohort_base cb
INNER JOIN cohort_sizes cs ON cb.cohort_month = cs.cohort_month
ORDER BY cb.cohort_month, cb.cohort_index;

-- 2. Pivoted Cohort Retention Rate Matrix (Month 0 through Month 12)
WITH customer_first_order AS (
    SELECT
        c.customer_unique_id,
        TO_CHAR(MIN(o.order_purchase_timestamp), 'YYYY-MM') AS cohort_month,
        DATE_TRUNC('month', MIN(o.order_purchase_timestamp))::DATE AS cohort_date
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
),
customer_orders AS (
    SELECT
        c.customer_unique_id,
        cfo.cohort_month,
        cfo.cohort_date,
        (EXTRACT(YEAR FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(YEAR FROM cfo.cohort_date)) * 12 +
        (EXTRACT(MONTH FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(MONTH FROM cfo.cohort_date)) AS cohort_index
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN customer_first_order cfo ON c.customer_unique_id = cfo.customer_unique_id
    WHERE o.order_status = 'delivered'
),
cohort_summary AS (
    SELECT
        cohort_month,
        cohort_index,
        COUNT(DISTINCT customer_unique_id) AS active_customers
    FROM customer_orders
    GROUP BY cohort_month, cohort_index
),
cohort_sizes AS (
    SELECT cohort_month, active_customers AS size_m0
    FROM cohort_summary
    WHERE cohort_index = 0
)
SELECT
    cs.cohort_month,
    cs.size_m0 AS cohort_size,
    ROUND(MAX(CASE WHEN cohort_index = 1 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m1_pct,
    ROUND(MAX(CASE WHEN cohort_index = 2 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m2_pct,
    ROUND(MAX(CASE WHEN cohort_index = 3 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m3_pct,
    ROUND(MAX(CASE WHEN cohort_index = 4 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m4_pct,
    ROUND(MAX(CASE WHEN cohort_index = 5 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m5_pct,
    ROUND(MAX(CASE WHEN cohort_index = 6 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m6_pct,
    ROUND(MAX(CASE WHEN cohort_index = 7 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m7_pct,
    ROUND(MAX(CASE WHEN cohort_index = 8 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m8_pct,
    ROUND(MAX(CASE WHEN cohort_index = 9 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m9_pct,
    ROUND(MAX(CASE WHEN cohort_index = 10 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m10_pct,
    ROUND(MAX(CASE WHEN cohort_index = 11 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m11_pct,
    ROUND(MAX(CASE WHEN cohort_index = 12 THEN active_customers ELSE 0 END) * 100.0 / cs.size_m0, 2) AS m12_pct
FROM cohort_sizes cs
LEFT JOIN cohort_summary csum ON cs.cohort_month = csum.cohort_month
GROUP BY cs.cohort_month, cs.size_m0
ORDER BY cs.cohort_month ASC;
