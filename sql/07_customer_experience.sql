-- ====================================================================
-- 07_customer_experience.sql
-- Logistics, Delivery Delays, Review Scores, and Repeat Purchase Dynamics
-- ====================================================================

-- 1. Review Score Distribution and Average Satisfaction KPIs
SELECT
    review_score,
    COUNT(*) AS total_reviews,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage_of_reviews
FROM reviews
GROUP BY review_score
ORDER BY review_score DESC;

-- 2. Delivery Timeliness vs Customer Review Score
-- Testing correlation between delay status and customer satisfaction
SELECT
    CASE
        WHEN o.is_delayed = TRUE THEN 'Delayed Delivery'
        WHEN o.order_delivered_customer_date IS NOT NULL THEN 'On-Time / Early Delivery'
        ELSE 'Not Delivered / In Transit'
    END AS delivery_performance,
    COUNT(DISTINCT o.order_id) AS total_orders,
    ROUND(AVG(r.review_score), 2) AS avg_review_score,
    SUM(CASE WHEN r.review_score >= 4 THEN 1 ELSE 0 END) AS positive_reviews,
    ROUND(SUM(CASE WHEN r.review_score >= 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(r.review_score), 2) AS positive_review_pct,
    SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) AS negative_reviews,
    ROUND(SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(r.review_score), 2) AS negative_review_pct,
    ROUND(AVG(o.delivery_duration_days), 1) AS avg_delivery_days,
    ROUND(AVG(o.delivery_delay_days), 1) AS avg_delay_days
FROM orders o
INNER JOIN reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY CASE
    WHEN o.is_delayed = TRUE THEN 'Delayed Delivery'
    WHEN o.order_delivered_customer_date IS NOT NULL THEN 'On-Time / Early Delivery'
    ELSE 'Not Delivered / In Transit'
END
ORDER BY avg_review_score DESC;

-- 3. Review Score by Delivery Duration Buckets
SELECT
    CASE
        WHEN delivery_duration_days <= 5 THEN '0 - 5 Days (Fast)'
        WHEN delivery_duration_days <= 10 THEN '6 - 10 Days (Standard)'
        WHEN delivery_duration_days <= 15 THEN '11 - 15 Days (Moderate)'
        WHEN delivery_duration_days <= 25 THEN '16 - 25 Days (Slow)'
        ELSE '26+ Days (Very Slow)'
    END AS delivery_speed_bucket,
    COUNT(DISTINCT o.order_id) AS order_count,
    ROUND(AVG(r.review_score), 2) AS avg_review_score,
    ROUND(SUM(CASE WHEN r.review_score = 5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS pct_5_star_reviews,
    ROUND(SUM(CASE WHEN r.review_score = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS pct_1_star_reviews
FROM orders o
INNER JOIN reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
  AND o.delivery_duration_days IS NOT NULL
GROUP BY CASE
    WHEN delivery_duration_days <= 5 THEN '0 - 5 Days (Fast)'
    WHEN delivery_duration_days <= 10 THEN '6 - 10 Days (Standard)'
    WHEN delivery_duration_days <= 15 THEN '11 - 15 Days (Moderate)'
    WHEN delivery_duration_days <= 25 THEN '16 - 25 Days (Slow)'
    ELSE '26+ Days (Very Slow)'
END
ORDER BY MIN(delivery_duration_days) ASC;

-- 4. Customer Experience Impact on Repeat Purchase Likelihood
-- Comparing repeat rates for customers whose first order was delayed vs on-time
WITH customer_first_experience AS (
    SELECT
        c.customer_unique_id,
        MIN(o.order_purchase_timestamp) AS first_purchase_date
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
),
first_order_details AS (
    SELECT
        cfe.customer_unique_id,
        o.order_id,
        o.is_delayed,
        r.review_score,
        o.delivery_duration_days
    FROM customer_first_experience cfe
    INNER JOIN customers c ON cfe.customer_unique_id = c.customer_unique_id
    INNER JOIN orders o ON c.customer_id = o.customer_id AND o.order_purchase_timestamp = cfe.first_purchase_date
    LEFT JOIN reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
),
customer_lifetime_orders AS (
    SELECT
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) AS lifetime_orders
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
)
SELECT
    CASE WHEN fod.is_delayed THEN 'First Order Delayed' ELSE 'First Order On-Time' END AS first_delivery_status,
    COUNT(DISTINCT fod.customer_unique_id) AS cohort_customer_count,
    ROUND(AVG(fod.review_score), 2) AS avg_first_review_score,
    SUM(CASE WHEN clo.lifetime_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers,
    ROUND(SUM(CASE WHEN clo.lifetime_orders > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT fod.customer_unique_id), 2) AS repeat_purchase_rate_pct
FROM first_order_details fod
INNER JOIN customer_lifetime_orders clo ON fod.customer_unique_id = clo.customer_unique_id
GROUP BY CASE WHEN fod.is_delayed THEN 'First Order Delayed' ELSE 'First Order On-Time' END;

-- 5. Top 10 Product Categories by Satisfaction and Delay Rate (Min 500 Orders)
SELECT
    p.product_category_name_english AS category,
    COUNT(DISTINCT o.order_id) AS order_count,
    ROUND(AVG(r.review_score), 2) AS avg_review_score,
    ROUND(AVG(o.delivery_duration_days), 1) AS avg_delivery_days,
    ROUND(SUM(CASE WHEN o.is_delayed THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT o.order_id), 2) AS delay_rate_pct,
    ROUND(SUM(oi.total_item_value), 2) AS total_category_revenue
FROM orders o
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
INNER JOIN reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY p.product_category_name_english
HAVING COUNT(DISTINCT o.order_id) >= 500
ORDER BY avg_review_score DESC
LIMIT 10;
