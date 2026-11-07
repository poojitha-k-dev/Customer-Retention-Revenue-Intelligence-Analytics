-- ====================================================================
-- 03_customer_analysis.sql
-- Customer Base, Order Frequency, Repeat Purchase, and Geographic Analysis
-- ====================================================================

-- 1. High-Level Customer & Purchase KPI Summary (Delivered Orders)
WITH customer_order_summary AS (
    SELECT
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(oi.price) AS total_spend_items,
        SUM(oi.total_item_value) AS total_spend_with_freight
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
)
SELECT
    COUNT(*) AS total_unique_customers,
    SUM(total_orders) AS total_delivered_orders,
    SUM(CASE WHEN total_orders = 1 THEN 1 ELSE 0 END) AS one_time_customers,
    SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers,
    ROUND(SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS repeat_purchase_rate_pct,
    ROUND(AVG(total_orders), 4) AS avg_orders_per_customer,
    ROUND(SUM(total_spend_items) / SUM(total_orders), 2) AS avg_order_value_items,
    ROUND(SUM(total_spend_with_freight) / SUM(total_orders), 2) AS avg_order_value_gross,
    ROUND(AVG(total_spend_with_freight), 2) AS avg_revenue_per_customer
FROM customer_order_summary;

-- 2. Customer Order Frequency Distribution
WITH customer_orders AS (
    SELECT
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS orders_count
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
)
SELECT
    orders_count,
    COUNT(*) AS customer_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS pct_of_customers
FROM customer_orders
GROUP BY orders_count
ORDER BY orders_count ASC;

-- 3. Geographic Distribution of Customers & Repeat Rate by State
WITH state_customers AS (
    SELECT
        c.customer_state,
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS orders_count,
        SUM(oi.total_item_value) AS customer_gross_spend
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_state, c.customer_unique_id
)
SELECT
    customer_state,
    COUNT(DISTINCT customer_unique_id) AS unique_customers,
    SUM(orders_count) AS total_orders,
    SUM(CASE WHEN orders_count > 1 THEN 1 ELSE 0 END) AS repeat_customers,
    ROUND(SUM(CASE WHEN orders_count > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT customer_unique_id), 2) AS repeat_rate_pct,
    ROUND(SUM(customer_gross_spend), 2) AS total_revenue,
    ROUND(AVG(customer_gross_spend), 2) AS avg_customer_spend
FROM state_customers
GROUP BY customer_state
ORDER BY total_revenue DESC;

-- 4. Days Between Repeat Purchases (Inter-Purchase Time Analysis)
WITH ordered_customer_purchases AS (
    SELECT
        c.customer_unique_id,
        o.order_id,
        o.order_purchase_timestamp,
        LAG(o.order_purchase_timestamp) OVER (
            PARTITION BY c.customer_unique_id
            ORDER BY o.order_purchase_timestamp
        ) AS previous_purchase_timestamp
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
),
repeat_gaps AS (
    SELECT
        customer_unique_id,
        order_id,
        order_purchase_timestamp,
        previous_purchase_timestamp,
        ROUND(EXTRACT(EPOCH FROM (order_purchase_timestamp - previous_purchase_timestamp)) / 86400.0, 1) AS days_between_orders
    FROM ordered_customer_purchases
    WHERE previous_purchase_timestamp IS NOT NULL
)
SELECT
    COUNT(*) AS total_repeat_transactions,
    ROUND(AVG(days_between_orders), 1) AS avg_days_between_purchases,
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY days_between_orders)::NUMERIC, 1) AS median_days_between_purchases,
    ROUND(MIN(days_between_orders), 1) AS min_days_between_purchases,
    ROUND(MAX(days_between_orders), 1) AS max_days_between_purchases
FROM repeat_gaps;

