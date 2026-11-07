# Technical Interview Guide & Case Study Preparation
## Customer Retention & Revenue Intelligence Platform

This guide provides battle-tested answers, architectural explanations, and analytical justifications for presenting this project during Data Analyst, Analytics Engineer, and Business Intelligence technical interviews.

---

## 1. 60-Second Executive Elevator Pitch

> *"In this project, I built an end-to-end Customer Retention & Revenue Intelligence platform analyzing ~100,000 orders from the Olist Brazilian E-Commerce marketplace. Using Python, PostgreSQL, and Power BI, I transformed raw transactional logs into relational data models, built an empirical RFM segmentation engine, and computed 12-month cohort retention matrices.*
>
> *Two major discoveries stood out: First, while the platform has a low baseline repeat purchase rate of 3.00%, repeat buyers spend 91.95% more than one-time buyers, and the top two RFM segments ('Potential Loyalists' and 'Cannot Lose Them') generate 60.9% of total platform gross revenue (R$ 9.39M). Second, fulfillment logistics is the single biggest driver of customer churn—on-time deliveries average 4.29 stars, whereas delayed deliveries collapse to 2.57 stars, cutting first-order repeat purchase rates by 13.8%. I packaged these insights into a 5-page Power BI dashboard with 20+ DAX measures and automated PyTest validation suites."*

---

## 2. Top 10 Technical & Analytical Interview Questions

### Q1: How did you solve the revenue double-counting problem when joining `order_items` and `payments`?
**The Trap:** Both `order_items` and `payments` have a one-to-many relationship with `orders`. An order can contain 3 items and be paid using 2 payment vouchers. If you write:
```sql
SELECT SUM(oi.price) FROM orders o 
JOIN order_items oi ON o.order_id = oi.order_id 
JOIN payments p ON o.order_id = p.order_id; -- DANGEROUS FAN-OUT!
```
Every item is duplicated for every payment method (Cartesian product / fan-out), multiplying calculated revenue by 6 instead of 3!

**The Solution:**
Pre-aggregate each child table to the `order_id` level in CTEs before joining to the order grain:
```sql
WITH oit AS (
    SELECT order_id, SUM(total_item_value) AS items_total 
    FROM order_items GROUP BY order_id
),
pt AS (
    SELECT order_id, SUM(payment_value) AS payment_total 
    FROM payments GROUP BY order_id
)
SELECT o.order_id, oit.items_total, pt.payment_total
FROM orders o
LEFT JOIN oit ON o.order_id = oit.order_id
LEFT JOIN pt ON o.order_id = pt.order_id;
```
This guarantees strict 1-to-1 cardinality at the order grain and prevents double-counting.

---

### Q2: Why is the repeat purchase rate only 3.00% in Olist? Does that mean the marketplace is failing?
**The Analytical Context:**
1. **Marketplace Gateway Model:** Olist is not a single merchant; it is an integration gateway connecting independent sellers to major Brazilian channels (Americanas, Submarino, Mercado Livre). Customers often build brand affinity with the individual product brand or seller rather than Olist.
2. **Catalog Composition (Durable Goods):** The top categories by volume are bedding/bath, furniture, computers, and home appliances. These are durable goods with multi-year replacement cycles, unlike groceries or personal care consumables which exhibit naturally higher 30-day repurchase frequencies.
3. **Right-Censored Window:** The dataset spans ~24 months. Customers acquired in mid-2018 had only 2–3 months of observed window before data collection ceased.
4. **Economic Reality:** Even with a 3.00% repeat rate, repeat customers generate a **91.95% revenue premium** (R$ 308.53 vs R$ 160.73).

---

### Q3: What is the architectural difference between `customer_id` and `customer_unique_id`, and why is this distinction critical?
- `customer_id`: A pseudo-random transactional key generated for every single checkout order. An individual customer who orders 5 times receives 5 distinct `customer_id` values.
- `customer_unique_id`: The persistent identifier representing the real-world person / Brazilian citizen tax account.
- **Why it matters:** If an analyst groups by `customer_id`, the repeat purchase rate will erroneously appear as **0.00%**. Accurately grouping by `customer_unique_id` uncovers the real 2,801 repeat customers and their true lifetime value.

---

### Q4: Walk me through your RFM scoring methodology. Why couldn't you use standard `NTILE(5)` on frequency?
- **The Problem with Standard NTILE(5):** In Olist, 97.00% of customers have exactly 1 order. If you apply `NTILE(5) OVER (ORDER BY frequency ASC)`, customers with 1 order get split across bins 1, 2, 3, and 4 arbitrarily, producing meaningless scores.
- **Our Solution:**
  - $R$ (Recency): Scored 1 to 5 using `NTILE(5) OVER (ORDER BY recency_days DESC)` because recency days follow a continuous distribution.
  - $M$ (Monetary): Scored 1 to 5 using `NTILE(5) OVER (ORDER BY monetary_value ASC)` because customer spend follows a continuous log-normal distribution.
  - $F$ (Frequency): Engineered using business-rule scoring:
    - $\ge 4$ orders $\implies F=5$
    - $3$ orders $\implies F=4$
    - $2$ orders $\implies F=3$
    - $1$ order with top 20% monetary spend $\implies F=2$ (High-value one-time buyers)
    - All other 1-order buyers $\implies F=1$

---

### Q5: How was the monthly cohort retention matrix calculated in PostgreSQL?
We structured a multi-stage Common Table Expression (CTE):
1. **Find First Purchase Date:**
   ```sql
   WITH customer_first_order AS (
       SELECT customer_unique_id, 
              DATE_TRUNC('month', MIN(order_purchase_timestamp))::DATE AS cohort_month
       FROM customers c JOIN orders o ON c.customer_id = o.customer_id
       WHERE o.order_status = 'delivered'
       GROUP BY customer_unique_id
   )
   ```
2. **Compute Cohort Index (Months Elapsed):**
   ```sql
   cohort_index = (EXTRACT(YEAR FROM order_date) - EXTRACT(YEAR FROM cohort_month)) * 12 +
                  (EXTRACT(MONTH FROM order_date) - EXTRACT(MONTH FROM cohort_month))
   ```
3. **Aggregate Active Users:** Count distinct `customer_unique_id` per `(cohort_month, cohort_index)`.
4. **Calculate Retention Rate %:** Divide active customers by `cohort_size` (where `cohort_index = 0`).

---

### Q6: What was the relationship between delivery delays and review scores? Did you establish causation or correlation?
- **Empirical Observation:** On-time deliveries averaged **4.29 ★**; delayed deliveries averaged **2.57 ★** (-1.72 stars).
- **Duration Sensitivity:** Review scores drop monotonically with fulfillment duration: $\le 5$ days is 4.41 ★; 16–25 days is 3.78 ★; $\ge 26$ days is 2.71 ★.
- **Causality vs Correlation:** In our business report, we deliberately distinguished correlation from causation. While delivery delay strongly correlates with negative ratings, other confounding factors exist (e.g., damaged transit packaging, out-of-stock seller dispatch delays). However, comparing first-order repeat rates revealed that delayed customers repeated at **2.62%** vs **3.04%** for on-time customers (**13.8% drop**), providing strong behavioral evidence of negative experience impact.

---

### Q7: Explain your Power BI Star Schema data model and how you ensured optimal DAX performance.
- **Star Schema Design:**
  - Fact Tables: `fact_orders` (order level) and `fact_order_items` (item level).
  - Dimension Tables: `dim_customer_rfm`, `dim_products`, `dim_sellers`, `dim_cohort`.
- **Performance Optimizations:**
  - Enforced single-direction cross-filtering (`1:*`) from dimensions to facts to eliminate bidirectional filter ambiguity.
  - Used integer surrogate keys (`recency_days`, `cohort_index`, `review_score`) rather than text strings for relationships and slicers.
  - Avoided calculated columns in DAX for row-level transformations; all durations and delay flags were pre-computed upstream in SQL/Python.

---

### Q8: How did you validate data quality and handle missing values in categories and reviews?
- **Products:** 610 products had null categories. We translated Portuguese names using `product_category_name_translation.csv` and imputed missing categories as `'uncategorized'` to preserve order referential integrity.
- **Reviews:** Duplicate `review_id` records were deduplicated by taking the latest `review_answer_timestamp` per order.
- **Automated Validation:** Built `src/data_validation.py` with automated assertions running inside PyTest verifying 0 foreign key orphans, 0 duplicate PKs, and strict numeric range bounds.

---

### Q9: If you were presenting to the VP of Marketing and Chief Logistics Officer, what 3 immediate initiatives would you recommend?
1. **Focus on 'Potential Loyalists' (33.41% Revenue):** Launch an automated post-purchase email sequence at Day 30 and Day 60 (before median 79.2-day re-order window) offering personalized replenishment discounts.
2. **Pre-Emptive Delay Credit Vouchers:** Trigger an automated apology email and R$ 15 shipping voucher the moment tracking detects a delivery will breach estimated delivery date—*before* the customer receives the package and leaves a 1-star review.
3. **Seller Fulfillment SLA Penalties:** Identify the bottom 5% of sellers responsible for >25% delay rates and deprioritize their listings in search rankings.

---

### Q10: How would you scale this analytics architecture if order volume grew from 100k to 100M rows?
1. **Storage & Warehousing:** Migrate from single-node PostgreSQL to a columnar cloud warehouse (Snowflake, BigQuery, or AWS Redshift) with date partitioning on `order_purchase_timestamp` and clustering on `customer_unique_id`.
2. **Transformations:** Move from Python Pandas scripts to **dbt (data build tool)** running automated SQL models with incremental materialization.
3. **Data Ingestion:** Replace batch CSV downloads with event streaming via Apache Kafka or AWS Kinesis capturing real-time order and tracking events.
4. **BI Layer:** In Power BI, switch from Import mode to **Composite Models** (Aggregations in Import mode, granular order drill-through via DirectQuery).
