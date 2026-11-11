# System Architecture & Technical Design Specification
## Customer Retention & Purchase Behaviour Intelligence Platform

---

## 1. System Architecture Overview

The system is architected as a modular, five-layer analytics engineering pipeline:

```mermaid
flowchart TD
    subgraph L1["Layer 1: Raw Data & Ingestion"]
        Olist["Olist Brazilian E-Commerce Dataset\n(9 CSV files, ~125 MB)"] --> IngestionModule["src/data_ingestion.py\n• Checksum & Byte-Size Audits\n• Missing File Auto-Retrieval"]
    end

    subgraph L2["Layer 2: Data Cleaning & Validation"]
        IngestionModule --> CleaningModule["src/data_cleaning.py\n• Timestamp ISO Parsing\n• Logistics Delay Metrics Calculation\n• Review Deduplication\n• Category Translation"]
        CleaningModule --> ValidationModule["src/data_validation.py\n• Assert 0 Duplicate Primary Keys\n• Assert 0 Orphaned Foreign Keys\n• Validate Numeric Value Ranges"]
        ValidationModule --> ProcessedStorage["data/processed/\n(Clean Normalized CSVs)"]
    end

    subgraph L3["Layer 3: Relational Warehouse & SQL Analytics"]
        ProcessedStorage --> DBLoader["src/database_loader.py\n• Bulk COPY into PostgreSQL 16"]
        DBLoader --> PostgresDB[("PostgreSQL 16: olist_db\n• 8 Relational Tables\n• B-Tree Indexes & Constraints")]
        PostgresDB --> SQLScripts["sql/ Analytical Engine\n• 01_schema.sql to 07_customer_experience.sql\n• Window Functions & Period Pivots"]
        SQLScripts --> SQLRunner["src/sql_runner.py\n• Generates Analytical Data Marts"]
    end

    subgraph L4["Layer 4: Service & Integration Layer"]
        SQLRunner --> MartsStorage["data/processed/ Marts\n• mart_customer_rfm.csv\n• mart_cohort_retention.csv\n• mart_orders_analytics.csv\n• mart_category_performance.csv"]
        MartsStorage --> FastAPIService["src/api.py (FastAPI on Port 8000)\n• GET /health\n• POST /pipeline/run (X-API-Key)\n• GET /reports/summary\n• GET /reports/retention\n• GET /reports/rfm\n• Swagger / OpenAPI Docs"]
    end

    subgraph L5["Layer 5: Orchestration, BI & Decision Support"]
        FastAPIService --> n8nWorkflows["n8n Automation Engine (Port 5678)\n• 01_automated_data_pipeline.json\n• 02_customer_retention_monitoring.json\n• 03_customer_segment_reporting.json"]
        MartsStorage --> PowerBI["Power BI Dashboard Suite\n• Page 1: Executive Overview\n• Page 2: Customer Retention\n• Page 3: RFM Segmentation\n• Page 4: Purchase Behaviour"]
        FastAPIService --> StreamlitApp["dashboard/app.py\n(Interactive Multi-Tab Web App)"]
    end
```

---

## 2. Technology Selection Rationale

| Component | Selected Technology | Alternative Considered | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Data Cleaning** | **Python (Pandas & NumPy)** | R / OpenRefine | Universal analytics adoption, high-performance vectorized operations, seamless integration with database drivers (`psycopg2`). |
| **Storage Engine** | **PostgreSQL 16** | SQLite / MySQL | ACID compliance, advanced SQL window functions (`NTILE`, `LAG`, `PERCENTILE_CONT`), high-speed `COPY` bulk ingestion, relational constraint enforcement. |
| **API Framework** | **FastAPI + Uvicorn** | Flask / Django | Asynchronous background task handling (`BackgroundTasks`), automatic OpenAPI/Swagger documentation, high concurrency, strict Pydantic type validation. |
| **Workflow Automation**| **n8n (Self-Hosted)** | Apache Airflow / Zapier | Visual workflow designer, low-code HTTP API node integrations, scheduled execution, zero cloud subscription fees, runs locally via `npx n8n`. |
| **Business Intelligence**| **Power BI Desktop** | Tableau / Looker | Industry-standard DAX analytical engine, high compression in-memory VertiPaq tabular model, Star Schema optimization, seamless CSV/SQL connectors. |

---

## 3. Data Flow & Security Architecture

1. **Environment Configuration:**
   - Database credentials, API security tokens, and file paths are stored in `.env` and excluded from git tracking via `.gitignore`.
   - `.env.example` provides a sanitized configuration template.
2. **API Key Authentication:**
   - Sensitive endpoints (`POST /pipeline/run`) require an `X-API-Key` HTTP header. Missing or incorrect keys return `403 Forbidden`.
3. **Non-Blocking Asynchronous Operations:**
   - When n8n or an external caller triggers `/pipeline/run`, FastAPI immediately returns `200 OK (Status: Initiated)` and offloads execution to an isolated background thread, preventing HTTP request timeouts on long-running batch jobs.

---

## 4. Resilience & Error Handling

- **Idempotent Ingestion:** The database loader checks if `olist_db` exists; table DDL scripts use `DROP TABLE IF EXISTS ... CASCADE` and recreate clean tables without leaving orphaned state.
- **Fail-Safe Data Marts:** If PostgreSQL is temporarily offline during scheduled reports, the API gracefully serves cached, validated analytical data marts from `data/processed/`.
- **Integrity Gates:** Automated PyTest test suites halt downstream deployments if primary key uniqueness or foreign key constraints fail.
