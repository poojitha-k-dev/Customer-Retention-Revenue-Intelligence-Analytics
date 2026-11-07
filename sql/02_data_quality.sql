-- ====================================================================
-- 02_data_quality.sql
-- Comprehensive Data Quality Audits, Null Checks, and Integrity Tests
-- ====================================================================

-- 1. Table Volume Audit
SELECT 'customers' AS table_name, COUNT(*) AS total_rows FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sellers', COUNT(*) FROM sellers
UNION ALL
SELECT 'geolocation', COUNT(*) FROM geolocation;

-- 2. Primary Key Uniqueness & Null Checks
SELECT
    COUNT(*) AS total_customers,
    COUNT(customer_id) AS non_null_pks,
    COUNT(DISTINCT customer_id) AS distinct_pks,
    COUNT(*) - COUNT(DISTINCT customer_id) AS duplicate_pks
FROM customers;

SELECT
    COUNT(*) AS total_orders,
    COUNT(order_id) AS non_null_pks,
    COUNT(DISTINCT order_id) AS distinct_pks,
    COUNT(*) - COUNT(DISTINCT order_id) AS duplicate_pks
FROM orders;

-- 3. Referential Integrity (Orphan Record Checks)
-- Orders referencing non-existent customers
SELECT COUNT(*) AS orphaned_orders
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

-- Order items referencing non-existent orders
SELECT COUNT(*) AS orphaned_order_items
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_id IS NULL;

-- Order items referencing non-existent products
SELECT COUNT(*) AS orphaned_products
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.product_id
WHERE p.product_id IS NULL;

-- 4. Order Status Breakdown & Delivered Order Ratio
SELECT
    order_status,
    COUNT(*) AS order_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM orders
GROUP BY order_status
ORDER BY order_count DESC;

-- 5. Timestamp Chronology Validation
-- Flagging chronological anomalies in delivery pipeline
SELECT
    COUNT(*) AS total_delivered_orders,
    SUM(CASE WHEN order_approved_at < order_purchase_timestamp THEN 1 ELSE 0 END) AS approved_before_purchase,
    SUM(CASE WHEN order_delivered_carrier_date < order_purchase_timestamp THEN 1 ELSE 0 END) AS carrier_before_purchase,
    SUM(CASE WHEN order_delivered_customer_date < order_delivered_carrier_date THEN 1 ELSE 0 END) AS customer_before_carrier,
    SUM(CASE WHEN is_delayed THEN 1 ELSE 0 END) AS late_deliveries,
    ROUND(SUM(CASE WHEN is_delayed THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS late_delivery_pct
FROM orders
WHERE order_status = 'delivered'
  AND order_delivered_customer_date IS NOT NULL;

-- 6. Payment Value vs Order Item Value Reconciliation
-- Identifying variance between payments captured and items invoiced
WITH order_item_totals AS (
    SELECT order_id, ROUND(SUM(total_item_value), 2) AS calculated_items_total
    FROM order_items
    GROUP BY order_id
),
payment_totals AS (
    SELECT order_id, ROUND(SUM(payment_value), 2) AS calculated_payment_total
    FROM payments
    GROUP BY order_id
)
SELECT
    COUNT(*) AS matched_orders,
    SUM(CASE WHEN ABS(oit.calculated_items_total - pt.calculated_payment_total) < 0.05 THEN 1 ELSE 0 END) AS exact_matches,
    SUM(CASE WHEN ABS(oit.calculated_items_total - pt.calculated_payment_total) >= 0.05 THEN 1 ELSE 0 END) AS variances,
    ROUND(AVG(ABS(oit.calculated_items_total - pt.calculated_payment_total)), 2) AS avg_absolute_variance
FROM order_item_totals oit
INNER JOIN payment_totals pt ON oit.order_id = pt.order_id;
