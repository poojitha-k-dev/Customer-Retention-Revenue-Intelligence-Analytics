# Business Requirements Document (BRD)
## Customer Retention & Purchase Behaviour Intelligence Platform

**Document Version:** 1.0.0  
**Project Sponsor:** VP of Marketing, VP of Operations, Chief Commercial Officer  
**Lead Analytics Engineer:** Senior Data Analyst & Analytics Engineer  
**Date:** November 2026  

---

## 1. Executive Summary & Business Need

In multi-seller e-commerce marketplaces, acquiring new buyers is typically 5 to 7 times more expensive than retaining existing customers. The Brazilian e-commerce marketplace (Olist) has reached ~100,000 orders across 93,358 unique customer accounts, but experiences high customer drop-off after the first purchase.

The executive leadership team requires a centralized, automated **Customer Retention & Purchase Behaviour Intelligence Platform** to:
1. Quantify the platform's baseline customer retention and repeat purchase rates.
2. Segment the customer base into actionable behavioral cohorts using RFM (Recency, Frequency, Monetary value).
3. Diagnose the operational and logistical root causes of customer churn.
4. Establish automated governance workflows that alert leadership when retention or fulfillment SLAs breach operational thresholds.

---

## 2. Business Objectives & Key Results (OKRs)

| Objective | Key Result (KR) | Target Metric |
| :--- | :--- | :---: |
| **KR 1: Measure Customer Repeat Rate** | Accurately compute unique purchaser repeat rate using persistent citizen tax accounts (`customer_unique_id`). | Baseline: **3.00%** |
| **KR 2: Identify High-Value Revenue Segments** | Segment customer base using RFM modeling and quantify revenue concentration. | Identify segments generating **>60%** of gross revenue |
| **KR 3: Uncover Fulfillment Churn Drivers** | Correlate delivery duration and delivery delay with customer satisfaction (CSAT) scores. | Quantify rating drop from late deliveries |
| **KR 4: Automated Retention Governance** | Implement automated monitoring that dispatches alerts when delay rates exceed 8% or repeat rates lag targets. | **100% automated** via n8n |
| **KR 5: Executive Self-Service BI** | Deliver a 4-page interactive Power BI dashboard with full DAX measure dictionary and star schema data models. | **4-page executive suite** |

---

## 3. Scope of the System

### In-Scope:
- Ingestion of 9 authentic Olist CSV datasets covering orders, order items, payments, reviews, customers, products, sellers, and geolocation.
- Cleaning, deduplication, timestamp chronological validation, and category translation.
- Relational schema modeling in PostgreSQL 16 with Primary Keys, Foreign Keys, and B-Tree indexes.
- Analytical SQL queries for cohorts, retention decay, RFM quintile scoring, and Pareto revenue deciles.
- REST API layer via FastAPI exposing analytical data marts and triggering asynchronous pipeline runs.
- n8n workflow automation for weekly pipeline orchestration, monthly SLA monitoring, and weekly executive briefings.
- 4-page Power BI dashboard specification with complete DAX measures and Star Schema modeling.

### Out-of-Scope:
- Real-time event streaming via Kafka (historical batch processing is sufficient for weekly/monthly governance).
- Direct payment gateway processing or financial settlement.

---

## 4. Key Stakeholders & User Personas

1. **Chief Executive Officer (CEO) / General Manager:**
   - *Needs:* High-level revenue trends, overall customer acquisition vs retention mix, and gross merchandise volume (GMV).
2. **VP of Retention & Lifecycle Marketing:**
   - *Needs:* Cohort retention heatmaps, inter-purchase elapsed time (median 79.2 days), RFM segment breakdowns, and lists of 'Potential Loyalists' for re-engagement campaigns.
3. **Head of Logistics & Supply Chain:**
   - *Needs:* Delivery delay rates (8.11%), average delay duration (9.6 days), impact of fulfillment delays on customer satisfaction ratings (2.57★ delayed vs 4.29★ on-time).
4. **Category & Merchandising Managers:**
   - *Needs:* Product category gross revenue, average item price, units sold, and category-level delay rates.

---

## 5. Core Business Questions Addressed

1. **How many customers make repeat purchases?**  
   *Finding:* Exactly **2,801 customers** out of 93,358 (3.00%).
2. **What percentage of customers return after their first purchase?**  
   *Finding:* Month 1 retention across monthly cohorts averages **0.40% to 0.62%** (median 0.50%).
3. **Which customer segments generate the highest revenue?**  
   *Finding:* **Potential Loyalists** (R$ 5.15M | 33.41%) and **Cannot Lose Them** (R$ 4.24M | 27.48%), totaling **60.89%** of platform revenue.
4. **Which customers are potentially at risk?**  
   *Finding:* 996 customers in 'At Risk' (average spend R$ 295.54, inactive 381.9 days) and 13,754 customers in 'Cannot Lose Them' (inactive 394.5 days).
5. **What is the average order value (AOV)?**  
   *Finding:* **R$ 159.83** across 96,478 delivered orders.
6. **What is the relationship between delivery delays and customer satisfaction?**  
   *Finding:* On-time orders average **4.29★**; delayed orders collapse to **2.57★** (-1.72 stars), and first-order delay reduces subsequent repeat rates by **13.8%**.
