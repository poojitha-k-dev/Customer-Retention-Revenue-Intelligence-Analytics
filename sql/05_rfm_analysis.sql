-- ====================================================================
-- 05_rfm_analysis.sql
-- Customer RFM Segmentation: Recency, Frequency, Monetary Value Scoring
-- ====================================================================

-- 1. Compute Raw RFM Metrics Per Unique Customer
WITH snapshot_date AS (
    SELECT MAX(order_purchase_timestamp)::DATE + INTERVAL '1 day' AS max_date
    FROM orders
    WHERE order_status = 'delivered'
),
raw_rfm AS (
    SELECT
        c.customer_unique_id,
        ((SELECT max_date FROM snapshot_date)::DATE - MAX(o.order_purchase_timestamp)::DATE)::INT AS recency_days,
        COUNT(DISTINCT o.order_id) AS frequency,
        ROUND(SUM(oi.total_item_value), 2) AS monetary_value
    FROM customers c
    INNER JOIN orders o ON c.customer_id = o.customer_id
    INNER JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY c.customer_unique_id
),
-- 2. Assign RFM Scores (1 to 5)
-- Recency: 5 quintiles (lower recency = higher score)
-- Monetary: 5 quintiles (higher spend = higher score)
-- Frequency: tailored scoring accounting for Olist distribution (97% 1-time buyers)
rfm_scored AS (
    SELECT
        customer_unique_id,
        recency_days,
        frequency,
        monetary_value,
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
),
-- 3. Segment Assignment Based on RFM Scores
rfm_segmented AS (
    SELECT
        customer_unique_id,
        recency_days,
        frequency,
        monetary_value,
        r_score,
        f_score,
        m_score,
        CONCAT(r_score, f_score, m_score) AS rfm_code,
        ROUND((r_score + f_score + m_score) / 3.0, 2) AS rfm_avg_score,
        CASE
            -- Champions: High recency, high frequency, high monetary
            WHEN r_score >= 4 AND f_score >= 4 THEN 'Champions'
            -- Loyal Customers: Good recency and frequency
            WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
            -- Potential Loyalists: Recent buyers with moderate spend
            WHEN r_score >= 4 AND f_score IN (1, 2) AND m_score >= 3 THEN 'Potential Loyalists'
            -- New Customers: Very recent buyers with 1 order
            WHEN r_score >= 4 AND f_score = 1 THEN 'New Customers'
            -- At Risk: Made multiple purchases or spent heavily, but haven't purchased recently
            WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
            -- Cannot Lose Them: Spent high monetary value in the past, long inactive
            WHEN r_score <= 2 AND m_score >= 4 THEN 'Cannot Lose Them'
            -- Hibernating: Low recency, low-to-mid frequency
            WHEN r_score = 2 AND f_score <= 2 THEN 'Hibernating'
            -- Lost Customers: Lowest recency and lowest frequency/spend
            ELSE 'Lost Customers'
        END AS customer_segment
    FROM rfm_scored
)
-- 4. Segment Summary Statistics
SELECT
    customer_segment,
    COUNT(*) AS total_customers,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS customer_share_pct,
    ROUND(AVG(recency_days), 1) AS avg_recency_days,
    ROUND(AVG(frequency), 2) AS avg_frequency,
    ROUND(AVG(monetary_value), 2) AS avg_monetary_value,
    ROUND(SUM(monetary_value), 2) AS total_segment_revenue,
    ROUND(SUM(monetary_value) * 100.0 / SUM(SUM(monetary_value)) OVER (), 2) AS revenue_share_pct
FROM rfm_segmented
GROUP BY customer_segment
ORDER BY total_segment_revenue DESC;
