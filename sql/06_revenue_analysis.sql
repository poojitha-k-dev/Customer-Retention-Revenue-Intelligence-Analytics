-- ====================================================================
-- 06_revenue_analysis.sql
-- Revenue Intelligence, Concentration, Repeat vs First-Time, and Realization
-- ====================================================================

-- 1. Realized Revenue vs Cancelled / Lost Revenue by Order Status
SELECT
    order_status,
    COUNT(DISTINCT o.order_id) AS total_orders,
    ROUND(SUM(oi.price), 2) AS merchandise_revenue,
    ROUND(SUM(oi.freight_value), 2) AS freight_revenue,
    ROUND(SUM(oi.total_item_value), 2) AS gross_revenue,
    ROUND(SUM(oi.total_item_value) * 100.0 / SUM(SUM(oi.total_item_value)) OVER (), 2) AS pct_of_total_demand
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY order_status
ORDER BY gross_revenue DESC NULLS LAST;

-- 2. Monthly Realized Revenue Trends (Delivered Orders Only)
SELECT
    o.purchase_year_month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT c.customer_unique_id) AS unique_purchasers,
    ROUND(SUM(oi.price), 2) AS net_merchandise_revenue,
    ROUND(SUM(oi.freight_value), 2) AS freight_revenue,
    ROUND(SUM(oi.total_item_value), 2) AS gross_revenue,
    ROUND(SUM(oi.total_item_value) / COUNT(DISTINCT o.order_id), 2) AS average_order_value
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY o.purchase_year_month
ORDER BY o.purchase_year_month ASC;

-- 3. Revenue Contribution: Repeat Customers vs One-Time Customers
WITH customer_order_totals AS (
    SELECT
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(oi.total_item_value) AS lifetime_spend
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
)
SELECT
    CASE WHEN total_orders > 1 THEN 'Repeat Customer' ELSE 'One-Time Customer' END AS customer_type,
    COUNT(*) AS total_customers,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS customer_pct,
    SUM(total_orders) AS total_orders,
    ROUND(SUM(total_orders) * 100.0 / SUM(SUM(total_orders)) OVER (), 2) AS orders_pct,
    ROUND(SUM(lifetime_spend), 2) AS total_revenue,
    ROUND(SUM(lifetime_spend) * 100.0 / SUM(SUM(lifetime_spend)) OVER (), 2) AS revenue_pct,
    ROUND(AVG(lifetime_spend), 2) AS avg_revenue_per_customer
FROM customer_order_totals
GROUP BY CASE WHEN total_orders > 1 THEN 'Repeat Customer' ELSE 'One-Time Customer' END;

-- 4. Customer Revenue Concentration (Deciles / Pareto Analysis)
WITH customer_spend AS (
    SELECT
        c.customer_unique_id,
        SUM(oi.total_item_value) AS total_spend
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
),
spend_deciles AS (
    SELECT
        customer_unique_id,
        total_spend,
        NTILE(10) OVER (ORDER BY total_spend DESC) AS revenue_decile
    FROM customer_spend
)
SELECT
    revenue_decile,
    COUNT(*) AS customer_count,
    ROUND(MIN(total_spend), 2) AS min_spend_in_decile,
    ROUND(MAX(total_spend), 2) AS max_spend_in_decile,
    ROUND(SUM(total_spend), 2) AS decile_revenue,
    ROUND(SUM(total_spend) * 100.0 / SUM(SUM(total_spend)) OVER (), 2) AS decile_revenue_share_pct,
    ROUND(SUM(SUM(total_spend)) OVER (ORDER BY revenue_decile ASC) * 100.0 / SUM(SUM(total_spend)) OVER (), 2) AS cumulative_revenue_pct
FROM spend_deciles
GROUP BY revenue_decile
ORDER BY revenue_decile ASC;

-- 5. Top 10 Customers by Realized Lifetime Spend
SELECT
    c.customer_unique_id,
    c.customer_city,
    c.customer_state,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(oi.order_item_id) AS total_items_bought,
    ROUND(SUM(oi.price), 2) AS merchandise_spend,
    ROUND(SUM(oi.freight_value), 2) AS freight_spend,
    ROUND(SUM(oi.total_item_value), 2) AS total_realized_revenue
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY c.customer_unique_id, c.customer_city, c.customer_state
ORDER BY total_realized_revenue DESC
LIMIT 10;

