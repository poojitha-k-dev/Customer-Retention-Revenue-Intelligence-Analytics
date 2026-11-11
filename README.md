# Customer-Retention-Revenue-Intelligence-Analytics
RetainIQ is an enterprise customer retention and revenue intelligence platform built with PostgreSQL, Python, FastAPI, and React. Analyzing 100k+ orders, it delivers cohort retention heatmaps, 5x5 RFM segmentation, and ML repeat purchase predictions to turn customer behavior into high-margin revenue growth.  *(309 characters with spaces)*
Here is the complete, production-ready `README.md` formatted specifically for **GitHub**. You can copy the code block below and paste it directly into your GitHub repository:

```markdown
# RetainIQ — Customer Retention & Purchase Behaviour Intelligence Platform

> **Tagline:** *Understand Customers. Predict Retention. Drive Growth.*  
> **Executive Summary:** RetainIQ is an enterprise customer retention and revenue intelligence platform built with PostgreSQL, Python, FastAPI, and React. Analyzing 100k+ orders, it delivers cohort retention heatmaps, 5x5 RFM segmentation, and ML repeat purchase predictions to turn customer behavior into high-margin revenue growth.

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0%2B-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![n8n](https://img.shields.io/badge/n8n-Automation-EA4B71.svg?logo=n8n&logoColor=white)](https://n8n.io/)
[![Power BI](https://img.shields.io/badge/Power_BI-Desktop-F2C811.svg?logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![Tests](https://img.shields.io/badge/PyTest-16%2F16%20Passed%20(100%25)-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Table of Contents
1. [Business Objective & Problem Statement](#1-business-objective--problem-statement)
2. [Executive Key Metrics & Analytical Findings](#2-executive-key-metrics--analytical-findings)
3. [End-to-End System Architecture](#3-end-to-end-system-architecture)
4. [Relational Warehouse Schema (PostgreSQL 16)](#4-relational-warehouse-schema-postgresql-16)
5. [Machine Learning Repeat Propensity Model](#5-machine-learning-repeat-propensity-model)
6. [SaaS Frontend Platform: RetainIQ (React + TS)](#6-saas-frontend-platform-retainiq-react--ts)
7. [Executive BI Dashboards (Streamlit & Power BI)](#7-executive-bi-dashboards-streamlit--power-bi)
8. [Workflow Automation (n8n Engine)](#8-workflow-automation-n8n-engine)
9. [Repository Directory Structure](#9-repository-directory-structure)
10. [Quickstart & Execution Guide](#10-quickstart--execution-guide)
11. [Automated Test Suite](#11-automated-test-suite)

---

## 1. Business Objective & Problem Statement

In fast-scaling digital marketplaces, customer acquisition cost (CAC) often surges while customer lifetime value (LTV) stagnates due to **churn and weak repeat purchasing dynamics**. Built on the authentic **Olist Brazilian E-Commerce dataset** (~100,000 orders across 9 relational datasets), RetainIQ answers four critical executive questions:

1. **Why do 97.00% of marketplace customers purchase only once?**
2. **Which customer segments drive over 60% of gross revenue, and how can they be protected from churn?**
3. **What is the quantitative relationship between delivery delays and customer satisfaction (CSAT)?**
4. **How can data-driven lifecycle triggers during the optimal repurchase window (Day 30–75) maximize customer retention?**

---

## 2. Executive Key Metrics & Analytical Findings

All analytical metrics are derived directly from verified qualifying delivered orders in the PostgreSQL relational warehouse:

| Metric Category | Key Indicator | Calculated Value | Strategic Business Interpretation |
| :--- | :--- | :---: | :--- |
| **Customer Base** | Unique Individual Buyers | **93,358** | Deduplicated via tax/citizen account ID (`customer_unique_id`) |
| **Gross Volume** | Realized Gross Revenue | **R$ 15,419,773.75** | Merchandised sales value + freight across delivered orders |
| **Repeat Purchasing** | Repeat Customer Rate | **3.00% (2,801 buyers)** | Low repeat rate characteristic of multi-seller durable goods |
| **LTV Premium** | Repeat Customer Spend Premium | **+91.95%** | Repeat buyers spend **R$ 308.53** vs **R$ 160.73** for 1-time buyers |
| **Order Economics** | Average Order Value (AOV) | **R$ 159.83** | Average basket size across 96,478 delivered orders |
| **Cohort Floor** | 12-Month Retention Floor | **0.25% – 0.35%** | Median Month 1 return rate is 0.50%, stabilizing at 0.25% |
| **Logistics Impact** | Delivery Delay Rate | **8.11% (7,826 orders)** | Average delay is **9.6 days** past estimated delivery date |
| **CSAT Drop** | Review Rating: On-Time vs Delayed | **4.29 ★ vs 2.57 ★** | Delivery delays trigger a **-1.72 star drop** & **-13.8% repeat loss** |
| **Revenue Upside** | Prioritized Opportunity Sizing | **+R$ 909,000 / yr** | Unlocked via automated win-back triggers and logistics SLAs |

### RFM Customer Segment Breakdown

| Customer Segment | Customer Count | Share (%) | Avg Recency | Avg Orders | Avg Spend | Segment Revenue | Revenue % | Recommended Strategic Action |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Potential Loyalists** | 21,816 | 23.37% | 104.2d | 1.05 | R$ 236.14 | **R$ 5,151,630.24** | **33.41%** | Category cross-sell recommendations |
| **Cannot Lose Them** | 13,754 | 14.73% | 382.6d | 1.02 | R$ 308.06 | **R$ 4,237,057.24** | **27.48%** | High-urgency tiered discount win-back |
| **Lost Customers** | 29,505 | 31.60% | 374.8d | 1.00 | R$ 77.29 | **R$ 2,280,441.45** | **14.79%** | Low-cost programmatic email re-activation |
| **New Customers** | 14,324 | 15.34% | 103.5d | 1.00 | R$ 76.54 | **R$ 1,096,358.96** | **7.11%** | Day 14 onboarding nurture sequence |
| **Hibernating** | 11,158 | 11.95% | 271.4d | 1.00 | R$ 84.18 | **R$ 939,280.44** | **6.09%** | Seasonal reactivation campaigns |
| **Loyal Customers** | 1,684 | 1.80% | 154.6d | 2.14 | R$ 293.42 | **R$ 494,119.28** | **3.20%** | Loyalty rewards & product feedback loops |
| **At Risk** | 996 | 1.07% | 391.2d | 2.12 | R$ 279.16 | **R$ 278,043.36** | **1.80%** | Day 45 automated win-back SMS/email |
| **Champions** | 121 | 0.13% | 72.8d | 3.24 | R$ 498.24 | **R$ 60,287.20** | **0.39%** | VIP concierge perks & early access |

---

## 3. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph Layer1["1. Raw Data Ingestion Layer"]
        A["9 Authentic Olist CSVs\n(~125 MB, data/raw/)"] --> B["Python Ingestion Engine\nsrc/data_ingestion.py"]
    end

    subgraph Layer2["2. Data Validation & Feature Engineering"]
        B --> C["Data Cleaner\nsrc/data_cleaning.py"]
        C --> D["Data Validator\nsrc/data_validation.py"]
        D --> E["Clean Dimension & Fact CSVs\ndata/processed/"]
    end

    subgraph Layer3["3. Relational Warehouse (PostgreSQL 16)"]
        E --> F["Bulk COPY Loader\nsrc/database_loader.py"]
        F --> G["Relational Schema\nsql/01_schema.sql (olist_db)"]
    end

    subgraph Layer4["4. SQL Analytical Marts"]
        G --> H["02_data_quality.sql"]
        G --> I["03_customer_analysis.sql"]
        G --> J["04_cohort_analysis.sql"]
        G --> K["05_rfm_analysis.sql"]
        G --> L["06_revenue_analysis.sql"]
        G --> M["07_customer_experience.sql"]
        H & I & J & K & L & M --> N["SQL Mart Runner\nsrc/sql_runner.py"]
        N --> O["Exported Mart CSVs\nmart_customer_rfm.csv (93k)\nmart_cohort_retention.csv (219)\nmart_orders_analytics.csv (99k)\nmart_category_performance.csv (74)"]
    end

    subgraph Layer5["5. Intelligence, API & Automation"]
        O --> P["ML Churn Classifier\nsrc/churn_prediction.py"]
        O --> Q["FastAPI REST Service\nsrc/api.py (:8000)"]
        Q --> R["n8n Automation Engine\nn8n/*.json (:5678)"]
    end

    subgraph Layer6["6. Visual SaaS & BI Interfaces"]
        Q & O --> S["RetainIQ React SaaS UI\nfrontend/ (:3000)"]
        O --> T["Streamlit Executive UI\ndashboard/app.py (:8501)"]
        O --> U["Power BI Star Schema\ndashboard/README.md"]
    end
```

---

## 4. Relational Warehouse Schema (PostgreSQL 16)

The data warehouse enforces referential integrity through foreign keys, composite primary keys, and B-Tree indexes:

```mermaid
erDiagram
    customers ||--o{ orders : "customer_id"
    orders ||--o{ order_items : "order_id"
    orders ||--o{ payments : "order_id"
    orders ||--o{ reviews : "order_id"
    products ||--o{ order_items : "product_id"
    sellers ||--o{ order_items : "seller_id"

    customers {
        varchar customer_id PK
        varchar customer_unique_id
        varchar customer_city
        varchar customer_state
    }
    orders {
        varchar order_id PK
        varchar customer_id FK
        varchar order_status
        timestamp order_purchase_timestamp
        timestamp order_delivered_customer_date
        timestamp order_estimated_delivery_date
    }
    order_items {
        varchar order_id FK
        int order_item_id PK
        varchar product_id FK
        varchar seller_id FK
        numeric price
        numeric freight_value
    }
    payments {
        varchar order_id FK
        int payment_sequential PK
        varchar payment_type
        int payment_installments
        numeric payment_value
    }
    reviews {
        varchar review_id
        varchar order_id FK
        int review_score
        timestamp review_creation_date
    }
    products {
        varchar product_id PK
        varchar product_category_name_english
        numeric product_weight_g
    }
    sellers {
        varchar seller_id PK
        varchar seller_city
        varchar seller_state
    }
```

---

## 5. Machine Learning Repeat Propensity Model

A **Random Forest Classifier** (`src/churn_prediction.py`) predicts customer repeat purchase propensity within 180 days based on first-order behavior.

- **Class Imbalance Strategy:** Balanced sub-sample class weighting + Precision-Recall AUC evaluation.
- **Cross-Validation:** 10-fold stratified cross-validation.
- **Top Predictive Features:**
  1. `total_items_spend` (High initial basket size strongly correlates with repeat intent)
  2. `freight_ratio` (Freight exceeding 25% of basket value drastically suppresses repeat propensity)
  3. `delivery_duration_days` (Shipments taking >15 days see a 42% collapse in repurchase likelihood)
  4. `review_score` (5-star first order buyers are 3.8x more likely to return than 1-star buyers)

---

## 6. SaaS Frontend Platform: RetainIQ (React + TS)

The modern dark-themed web platform in `frontend/` delivers 8 interactive analytical pages:

1. **Overview Dashboard (`OverviewPage.tsx`)**: High-level retention KPIs, revenue trajectory, repeat vs one-time mix, and retention decay.
2. **Customer Analytics (`CustomerAnalyticsPage.tsx`)**: Order frequency distributions, spend elasticity tiers, and top 10 Brazilian states directory.
3. **Retention & Cohort Analysis (`RetentionCohortPage.tsx`)**: 12-month cohort retention matrix heatmap, decay curve with peak bands, and monthly acquisition volume.
4. **RFM Segmentation (`RFMSegmentationPage.tsx`)**: Interactive 5x5 RFM score matrix grid with cell click inspector and segment economics table.
5. **Purchase Behaviour & CSAT (`PurchaseBehaviourPage.tsx`)**: Inter-purchase interval distribution (median 79.2 days; Day 30–75 re-engagement window), logistics delay CSAT collapse, and payment installment adoption.
6. **Business Insights & Strategy (`BusinessInsightsPage.tsx`)**: 4 revenue playbooks (+R$ 909K opportunity) and an interactive Retention ROI Simulator slider.
7. **Data Pipeline & Automation (`DataPipelinePage.tsx`)**: Architecture flow diagram, n8n workflow triggers, one-click pipeline refresh, and 10/10 data audit table.
8. **Customer Data Explorer (`DataExplorerPage.tsx`)**: Searchable, sortable, and filterable table of customers with ID copy buttons and CSV export.

---

## 7. Executive BI Dashboards (Streamlit & Power BI)

- **Interactive Streamlit App (`dashboard/app.py`)**: Replicates executive Power BI designs with an RFM 5x5 heatmap, top KPI cards (Recency, Frequency, Monetary), customer segments bar charts, and structured insights sidebar.
- **Power BI Enterprise Model (`dashboard/README.md`)**: Complete Star Schema data model with an exhaustive DAX measures library and Power Query transformation scripts (`power_query_scripts.m`).

---

## 8. Workflow Automation (n8n Engine)

Ready-to-import JSON workflows located in `n8n/`:

1. **`01_automated_data_pipeline.json`**: Daily cron (02:00 UTC) triggering Python ETL, PostgreSQL COPY reload, and analytical mart export.
2. **`02_customer_retention_monitoring.json`**: Scheduled monitoring alerting on repeat rate drops below 2.8%.
3. **`03_customer_segment_reporting.json`**: Weekly Monday executive Slack & email report aggregating dormant "Cannot Lose Them" buyers.

---

## 9. Repository Directory Structure

```
Customer Retention & Revenue Intelligence Analytics/
├── data/
│   ├── raw/                        # 9 authentic Olist CSV dataset files
│   └── processed/                  # Cleaned CSVs & 4 analytical marts
├── frontend/                       # RetainIQ Modern Dark SaaS App (React 18 + TS + Tailwind)
│   ├── src/
│   │   ├── components/             # Reusable UI & Layout components
│   │   ├── pages/                  # 8 interactive analytical pages
│   │   ├── services/api.ts         # Centralized API service with live auto-discovery
│   │   └── types/index.ts          # TypeScript domain interfaces
│   ├── package.json
│   └── vite.config.ts
├── dashboard/
│   ├── app.py                      # Interactive Streamlit executive dashboard
│   ├── power_query_scripts.m       # Power Query M code for Star Schema
│   └── theme_corporate_navy.json   # Corporate Power BI JSON theme
├── sql/
│   ├── 01_schema.sql               # PostgreSQL DDL with PK/FK constraints & indexes
│   ├── 02_data_quality.sql         # Automated database audit queries
│   ├── 03_customer_analysis.sql    # Customer frequency & spend SQL
│   ├── 04_cohort_analysis.sql      # Monthly cohort retention matrix SQL
│   ├── 05_rfm_analysis.sql         # 5x5 RFM quintile segmentation SQL
│   ├── 06_revenue_analysis.sql     # Revenue realization & Pareto SQL
│   └── 07_customer_experience.sql  # Logistics delay vs CSAT SQL
├── src/
│   ├── api.py                      # FastAPI REST service with Swagger UI
│   ├── churn_prediction.py         # Scikit-Learn Random Forest repeat model
│   ├── config.py                   # Centralized paths & database credentials
│   ├── data_cleaning.py            # Feature engineering & ISO date parser
│   ├── data_validation.py          # DataValidator audit class
│   ├── database_loader.py          # High-performance PostgreSQL COPY loader
│   └── sql_runner.py               # SQL execution engine & mart exporter
├── n8n/                            # 3 production n8n automation workflows
├── notebooks/                      # Exploratory Data Analysis Jupyter Notebooks
├── reports/                        # Business insights & ML performance documentation
├── tests/                          # 16 automated PyTest unit & integration tests
├── run_pipeline.py                 # Master end-to-end Python pipeline runner
├── run_frontend.bat                # 1-Click launcher for RetainIQ React Frontend
├── run_dashboard.bat               # 1-Click launcher for Streamlit Dashboard
└── requirements.txt                # Python dependencies
```

---

## 10. Quickstart & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm
- PostgreSQL 16 (running on `localhost:5432`, DB `olist_db`)

### Step 1: Run the End-to-End Pipeline
Executes data ingestion, validation, PostgreSQL bulk loading, SQL mart creation, ML model training, and automated tests:
```powershell
py run_pipeline.py
```

### Step 2: Launch the RetainIQ Modern SaaS Frontend
```powershell
# From project root:
.\run_frontend.bat

# Or using powershell:
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Step 3: Launch the FastAPI REST Service
```powershell
py -m uvicorn src.api:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger UI documentation is available at **`http://localhost:8000/docs`**.

### Step 4: Launch the Streamlit Executive Dashboard
```powershell
.\run_dashboard.bat
```
*(Or run `py -m streamlit run dashboard/app.py`)*

### Step 5: Launch n8n Workflow Automation
```powershell
npx n8n
```
Open `http://localhost:5678` and import workflows from the `n8n/` folder.

---

## 11. Automated Test Suite

Run the full automated test suite verifying API endpoints, data validation rules, RFM quintile assignments, and cohort calculations:
```powershell
py -m pytest tests/ -v
```

**Results:** `16 passed in 3.18s (100% pass rate)`.

---

## 📄 License
This project is licensed under the MIT License.
```

---

### How to Add This to Your GitHub Repository:
1. In your GitHub repository, click on **`Add file`** $\rightarrow$ **`Create new file`** (or click on the existing `README.md` and select the pencil **Edit** icon).
2. Paste the markdown content above into the editor.
3. Scroll down and click **`Commit changes...`**. GitHub will render the badges, tables, and Mermaid architecture diagrams.
