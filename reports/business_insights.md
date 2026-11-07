# Executive Business Insights & Strategic Recommendations
## Customer Retention & Revenue Intelligence Platform

**Dataset:** Olist Brazilian E-Commerce Public Dataset  
**Scope:** 99,441 Total Orders | 96,478 Delivered Orders | 93,358 Unique Customers  
**Total Analyzed Realized Revenue:** R$ 15,419,773.75  
**Observation Window:** September 2016 – October 2018  

---

## Executive Summary

This report synthesizes the core findings from our end-to-end data pipeline, relational PostgreSQL data warehouse, and RFM customer segmentation models. The primary business problem addressed is **customer retention dynamics, revenue concentration, and the operational drivers of customer churn** across the Olist marketplace.

### Headline Findings:
1. **Low Baseline Repeat Purchase Rate (3.00%):** Out of 93,358 unique purchasers, only 2,801 customers made more than one purchase during the two-year observation period.
2. **Repeat Revenue Contribution (5.60%):** Repeat buyers generated R$ 864,187.46 of the total R$ 15.42M gross realized revenue.
3. **Extreme Revenue Concentration:** Top 2 segments—**Potential Loyalists** and **Cannot Lose Them**—contribute **60.90%** (R$ 9.39M) of total platform gross revenue.
4. **Logistics is the Decisive CSAT Catalyst:** 8.11% of deliveries (7,826 orders) were delayed beyond the estimated delivery date. On-time deliveries average **4.29 ★**, whereas delayed deliveries collapse to **2.57 ★** (-1.72 drop), with over 55% submitting 1-star reviews.

---

## Answers to Core Business Questions

### 1. Which customer segments generate the highest revenue?

Based on our empirical RFM segmentation model:
- **Potential Loyalists (Rank #1 Revenue):** 21,816 customers (23.37% of customer base) generated **R$ 5,152,489.51** (33.41% of total revenue). They have high recent engagement (average recency 91.4 days) and healthy average spend (R$ 236.18), but have only made 1 order so far.
- **Cannot Lose Them (Rank #2 Revenue):** 13,754 customers (14.73% of customer base) generated **R$ 4,237,964.35** (27.48% of total revenue). These are historically high-spending accounts (average spend R$ 308.13), but they are severely inactive (average recency 394.5 days).
- **Lost Customers (Rank #3 Revenue):** 29,505 customers (31.60% of customer base) generated **R$ 3,569,180.42** (23.15% of revenue). Inactive for over 318 days with low-to-moderate historical spend (R$ 120.97).
- **Champions & Loyal Customers:** While exhibiting high frequency (average 2.0 to 3.5 orders) and high order values, they comprise only 1.93% of the customer base (1,805 customers combined) generating **R$ 569,830.58** (3.69% of revenue).

| Customer Segment | Customers | Customer Share % | Total Revenue (BRL) | Revenue Share % | Avg Recency (Days) | Avg Frequency | Avg Spend (BRL) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Potential Loyalists** | 21,816 | 23.37% | R$ 5,152,489.51 | **33.41%** | 91.4 | 1.00 | R$ 236.18 |
| **Cannot Lose Them** | 13,754 | 14.73% | R$ 4,237,964.35 | **27.48%** | 394.5 | 1.00 | R$ 308.13 |
| **Lost Customers** | 29,505 | 31.60% | R$ 3,569,180.42 | **23.15%** | 318.5 | 1.00 | R$ 120.97 |
| **Hibernating** | 11,158 | 11.95% | R$ 813,806.47 | **5.28%** | 316.7 | 1.00 | R$ 72.93 |
| **New Customers** | 14,324 | 15.34% | R$ 782,145.54 | **5.07%** | 90.3 | 1.00 | R$ 54.60 |
| **Loyal Customers** | 1,684 | 1.80% | R$ 502,945.44 | **3.26%** | 134.9 | 2.03 | R$ 298.66 |
| **At Risk** | 996 | 1.07% | R$ 294,356.88 | **1.91%** | 381.9 | 2.08 | R$ 295.54 |
| **Champions** | 121 | 0.13% | R$ 66,885.14 | **0.43%** | 89.8 | 3.52 | R$ 552.77 |

---

### 2. What percentage of customers make repeat purchases?

- **Repeat Purchase Rate:** Exactly **3.00%** (2,801 out of 93,358 customers).
- **One-Time Purchasers:** **97.00%** (90,557 customers).
- **Order Count Breakdown:**
  - 1 order: 90,557 customers (97.00%)
  - 2 orders: 2,573 customers (2.76%)
  - 3 orders: 181 customers (0.19%)
  - 4 orders: 28 customers (0.03%)
  - 5 to 16 orders: 19 customers (0.02%)
- **Economic Impact:** Despite comprising only 3.00% of customers, repeat purchasers contributed **5.60% of total revenue** and exhibited an average customer revenue of **R$ 308.53** (compared to R$ 160.73 for one-time buyers), representing a **91.95% revenue premium per customer**.

---

### 3. Which cohorts show stronger or weaker retention?

Our monthly cohort retention matrix (Month 0 through Month 12) demonstrates:
- **Baseline Retention:** Month 1 retention across cohorts ranges from **0.18% to 0.62%** (median: 0.50%). By Month 6, retention settles at **0.25% - 0.40%**.
- **Stronger Cohorts:**
  - **April 2017 Cohort:** Showed the highest Month 1 retention rate at **0.62%** (14 active repeat purchasers from 2,274 initial buyers).
  - **July 2017 Cohort:** Showed consistent repeat activity through Month 12 (0.53% at M1, 0.35% at M2, 0.32% at M6).
- **Weaker Cohorts:**
  - **February 2017 Cohort:** Registered only **0.18%** retention in Month 1.
  - **Early 2018 Cohorts (Jan–Mar 2018):** Despite acquiring large cohort volumes (>6,500 new customers per month), retention flattened to **0.30% - 0.38%**, indicating high acquisition leakage without retention infrastructure.

---

### 4. Which customers are potentially at risk?

1. **'At Risk' Segment (996 customers | R$ 294.3k revenue):**
   - High lifetime value (average R$ 295.54) and proven repeat intent (average frequency 2.08 orders).
   - Inactivity has reached an alarming average of **381.9 days** without a purchase.
2. **'Cannot Lose Them' Segment (13,754 customers | R$ 4.24M revenue):**
   - Historically high spenders (average spend R$ 308.13, 27.48% of platform revenue).
   - Inactivity has reached an average of **394.5 days**. Without an automated re-engagement trigger, these high-value customers lapse completely into 'Lost Customers'.

---

### 5. Which segments should the business prioritize?

Prioritization Matrix based on Expected Return on Investment (ROI):
1. **Tier 1 Priority: 'Potential Loyalists' (21,816 customers)**
   - *Rationale:* They have made high-value purchases (R$ 236 avg), are fresh in their lifecycle (recency < 90 days), and represent 33.41% of gross sales. Nurturing this segment has the lowest friction and highest yield for generating a 2nd order.
2. **Tier 2 Priority: 'Cannot Lose Them' (13,754 customers)**
   - *Rationale:* They generate over R$ 4.2M in gross demand. Even a 5% reactivation rate in this segment would recover ~R$ 212k in gross merchandise value.
3. **Tier 3 Priority: 'Loyal Customers' & 'Champions' (1,805 customers)**
   - *Rationale:* Platform advocates. Require VIP perks, seller direct-messaging, and loyalty rewards to maintain top-of-mind affinity.

---

### 6. What is the relationship between delivery delays and customer satisfaction?

Empirical analysis proves that delivery punctuality is the single most influential determinant of customer satisfaction:
- **On-Time Deliveries:** 88,652 orders (91.89%). Average review rating is **4.29 ★ / 5.0**. Positive reviews (4-5 stars) exceed **82.3%**.
- **Delayed Deliveries:** 7,826 orders (8.11%). Average review rating plummets to **2.57 ★ / 5.0** (a drop of **-1.72 stars**). Over **55.6%** of delayed customers leave a 1-star review.
- **Duration Sensitivity:**
  - Deliveries completed in ≤5 days average **4.41 ★**.
  - Deliveries taking 16–25 days drop to **3.78 ★**.
  - Deliveries exceeding 26 days drop to **2.71 ★**.
- **Impact on Repeat Purchases:** Customers whose first order was delayed exhibited a repeat purchase rate of **2.62%**, compared to **3.04%** for customers whose first order arrived on time (a **13.8% reduction in repeat rate** directly attributable to logistical failure).

---

### 7. How can the business improve customer retention?

1. **Launch a Structured Post-Purchase 30-60-90 Day Lifecycle Email Cadence:**
   - *Inter-purchase analysis shows median time between orders is 79.2 days.*
   - Trigger personalized product replenishment or complementary recommendations at Day 25, Day 50, and Day 75 post-delivery.
2. **Mitigate Delivery Delay Churn via Automated Pre-Emptive Communication:**
   - If carrier tracking indicates an order will breach estimated delivery, trigger an immediate apology email with a shipping voucher before the customer submits a review.
3. **Category Bundling & Consumables Expansion:**
   - Expand cross-selling from durable categories (furniture, tech) into recurring consumables (health/beauty, pet supplies, gourmet food).

---

### 8. What are the limitations of this dataset?

To ensure analytical integrity, we document the following limitations:
1. **Observation Window (24 Months):** The dataset spans from late 2016 through mid 2018. Customers acquired in mid-2018 have less elapsed time to place repeat orders than customers acquired in early 2017 (right-censoring).
2. **Customer Identifier Architecture:** Olist assigns a new `customer_id` for each order; repeat customers can only be tracked via `customer_unique_id`. If a consumer changes their email or tax ID, their purchases are split.
3. **Marketplace Seller Aggregation:** Olist is a merchant gateway. Customers interact with individual third-party merchants; brand affinity often attaches to the underlying seller or product brand rather than Olist itself.
4. **Product Catalog Skew:** The catalog is heavily weighted toward durable goods (bedding, furniture, computers) with inherently multi-year replacement cycles, naturally dampening 30-day retention rates.

---

### 9. What business actions are supported by the analysis?

| Strategic Initiative | Target Segment | Metric Impacted | Implementation Roadmap |
| :--- | :--- | :--- | :--- |
| **Second-Order Acceleration Campaign** | Potential Loyalists (21.8k users) | Repeat Purchase Rate (+1.5% target) | Deliver discount voucher within 30 days of 1st delivery |
| **Logistics SLA & Seller Performance Filter** | Late Sellers (>15% delay rate) | Delayed Order Rate (reduce from 8.1% to <4%) | Deprioritize slow fulfillment partners in search algorithm |
| **Reactivation Blitz** | Cannot Lose Them (13.7k users) | Reactivation Revenue (R$ 200k+ potential) | Send personalized win-back catalog with free shipping |
| **VIP Loyalty Club** | Champions & Loyal (1.8k users) | Frequency & LTV | Offer exclusive product previews and priority fulfillment |

