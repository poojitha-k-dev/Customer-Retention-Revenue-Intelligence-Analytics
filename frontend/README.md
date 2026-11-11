# RetainIQ Frontend — Customer Retention & Revenue Intelligence Platform

> **Tagline:** *Understand Customers. Predict Retention. Drive Growth.*

RetainIQ is an executive-grade SaaS customer analytics platform inspired by Mixpanel and Amplitude, built for exploring customer retention, cohort degradation, RFM segmentation, and lifetime value across the authentic Olist Brazilian E-Commerce dataset.

---

## 🚀 Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Dark Navy Executive Theme: `#0B0F19`, `#0D1322`, `#111827`, `#1F293D`)
- **Data Visualizations:** Recharts (Area, Bar, Pie, Composed, Matrix Heatmaps)
- **Icons:** Lucide React (`lucide-react`)
- **Backend Integration:** Centralized TypeScript API service (`src/services/api.ts`) connecting to FastAPI (`http://127.0.0.1:8000`) with authentic PostgreSQL analytical data fallbacks.

---

## 📊 Pages & Feature Modules

1. **Overview Dashboard (`OverviewPage.tsx`)**
   - High-level retention KPIs (Gross Realized Revenue, Unique Buyers, 3.00% Repeat Rate, Customer LTV).
   - Monthly revenue growth trajectory area chart.
   - Repeat vs one-time customer spend mix.
   - RFM revenue concentration bar chart.
   - Platform retention decay curve.
   - Strategic automated action card.

2. **Customer Analytics (`CustomerAnalyticsPage.tsx`)**
   - Order frequency distribution (1 order vs 2+ orders).
   - Spend tiers and purchase elasticity breakdown.
   - Geographic density across top 10 Brazilian states (SP, RJ, MG, RS, PR, etc.).

3. **Retention & Cohort Analysis (`RetentionCohortPage.tsx`)**
   - Interactive monthly cohort retention matrix heatmap (Month 0 to Month 12).
   - Platform-wide retention decay curve with benchmark peak bands.
   - Monthly new customer acquisition volume bar chart.

4. **RFM Segmentation (`RFMSegmentationPage.tsx`)**
   - Interactive 5x5 Recency vs Frequency matrix heatmap with segment badges and cell inspector.
   - Customer Segments bar chart and distribution donut chart.
   - Full RFM segment economics table with strategic action recommendations.

5. **Purchase Behaviour & CSAT (`PurchaseBehaviourPage.tsx`)**
   - Inter-purchase interval distribution (median 79.2 days; Day 30-75 optimal window).
   - Delivery delay impact on CSAT review scores (4.29 ★ on-time vs 2.57 ★ delayed; -13.8% repeat reduction).
   - Payment method breakdown (Credit Card 76.5%, Boleto 19.4%).
   - Consumer financing installment usage.

6. **Business Insights & Strategy (`BusinessInsightsPage.tsx`)**
   - 4 prioritized revenue playbooks with financial impact sizing (+R$ 909K total potential).
   - Interactive Retention ROI & Revenue Growth simulator slider.

7. **Data Pipeline & Automation (`DataPipelinePage.tsx`)**
   - End-to-end architecture flow (Raw CSVs -> Python ETL -> PostgreSQL -> SQL Marts -> FastAPI -> n8n -> RetainIQ).
   - 3 production n8n workflows overview (`01_automated_data_pipeline`, `02_customer_retention_monitoring`, `03_customer_segment_reporting`).
   - One-click pipeline refresh trigger via FastAPI `/pipeline/run`.
   - Data quality and validation test audit report (10/10 passing).

8. **Customer Data Explorer (`DataExplorerPage.tsx`)**
   - Searchable, filterable, and sortable directory of customers with RFM codes, lifetime spend, and review scores.
   - Paginated table with customer ID copy buttons.
   - Direct CSV export.

---

## 🏃 Running the Application

### 1. Start the RetainIQ Frontend
```powershell
# From project root:
.\run_frontend.bat

# Or using powershell:
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Optional: Start the FastAPI Backend
```powershell
py -m uvicorn src.api:app --host 127.0.0.1 --port 8000 --reload
```
RetainIQ automatically detects the live FastAPI service on port 8000 and switches to live sync mode!

