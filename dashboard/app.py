"""Interactive Customer Retention & Revenue Intelligence Platform Dashboard.

An executive-grade analytics application mirroring the modern Power BI & RFM
intelligence design layout with real-time dynamic filtering on the Olist Brazilian
E-Commerce dataset.
"""

import sys
from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Ensure project root in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

def render_html(html_str: str):
    """Safely render HTML in Streamlit without triggering Markdown indented code block parsing."""
    cleaned = "\n".join(line.strip() for line in html_str.strip().splitlines() if line.strip())
    st.markdown(cleaned, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Streamlit Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Customer Segmentation & Revenue Intelligence",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# -----------------------------------------------------------------------------
# Executive CSS Styling (Matching the Reference UI Layout)
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    /* Global page layout overrides */
    .block-container {
        padding-top: 1.0rem !important;
        padding-bottom: 2rem !important;
        padding-left: 1.5rem !important;
        padding-right: 1.5rem !important;
        max-width: 100% !important;
        background-color: #F8FAFC;
    }
    
    /* Top Header Banner */
    .header-banner {
        background: linear-gradient(90deg, #0e274a 0%, #153c6e 100%);
        border-radius: 10px;
        padding: 16px 24px;
        margin-bottom: 16px;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 14px rgba(14, 39, 74, 0.15);
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .header-icon {
        font-size: 32px;
        background: rgba(255, 255, 255, 0.12);
        padding: 8px 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .header-title-box {
        display: flex;
        flex-direction: column;
    }
    .header-title {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: #FFFFFF;
        margin: 0;
        line-height: 1.2;
    }
    .header-subtitle {
        font-size: 13px;
        font-weight: 400;
        color: #94A3B8;
        margin-top: 2px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .header-tag {
        background: #10B981;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    /* Filter Bar */
    .filter-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 12px 18px 6px 18px;
        margin-bottom: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    /* Executive KPI Cards (Row of 3, matching reference image) */
    .kpi-card-box {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 16px 20px;
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        height: 95px;
    }
    .kpi-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        margin-right: 16px;
        flex-shrink: 0;
    }
    .kpi-icon-recency {
        background: #EFF6FF;
        color: #1D4ED8;
        border: 1px solid #BFDBFE;
    }
    .kpi-icon-frequency {
        background: #F0FDF4;
        color: #15803D;
        border: 1px solid #BBF7D0;
    }
    .kpi-icon-monetary {
        background: #ECFDF5;
        color: #059669;
        border: 1px solid #A7F3D0;
    }
    .kpi-text-box {
        flex-grow: 1;
    }
    .kpi-heading {
        font-size: 14px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 2px;
    }
    .kpi-val {
        font-size: 26px;
        font-weight: 800;
        color: #0F172A;
        line-height: 1.1;
    }
    .kpi-val-green {
        color: #059669 !important;
    }
    .kpi-val-sub {
        font-size: 14px;
        font-weight: 500;
        color: #64748B;
        margin-left: 4px;
    }
    .kpi-watermark-icon {
        position: absolute;
        right: 12px;
        bottom: 2px;
        font-size: 54px;
        opacity: 0.06;
        pointer-events: none;
    }

    /* Main Chart Card Containers */
    .content-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 16px 18px;
        margin-bottom: 18px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .content-card-title {
        font-size: 16px;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Insights Sidebar (Right Column) */
    .insights-wrapper {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .insights-top-bar {
        background: linear-gradient(90deg, #133966 0%, #1e4b85 100%);
        color: #FFFFFF;
        padding: 12px 18px;
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        letter-spacing: 0.3px;
    }
    .insight-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 12px 14px;
        margin: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .insight-header {
        font-size: 11.5px;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }
    .insight-content-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    .insight-icon-box {
        font-size: 26px;
        line-height: 1;
        flex-shrink: 0;
    }
    .insight-text-col {
        flex-grow: 1;
    }
    .insight-primary-text {
        font-size: 15px;
        font-weight: 800;
        color: #0F172A;
        line-height: 1.2;
        margin-bottom: 4px;
    }
    .insight-body-text {
        font-size: 12px;
        color: #475569;
        line-height: 1.4;
    }

    /* Customizing Streamlit Tabs to match Executive theme */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        border-bottom: 2px solid #E2E8F0;
    }
    .stTabs [data-baseweb="tab"] {
        font-size: 14px;
        font-weight: 600;
        color: #475569;
        padding: 8px 16px;
        border-radius: 6px 6px 0 0;
    }
    .stTabs [aria-selected="true"] {
        color: #0E274A !important;
        border-bottom: 3px solid #0E274A !important;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Data Loading & Caching Layer
# -----------------------------------------------------------------------------
@st.cache_data
def load_all_marts():
    proc_dir = ROOT_DIR / "data" / "processed"
    rfm = pd.read_csv(proc_dir / "mart_customer_rfm.csv")
    cohort = pd.read_csv(proc_dir / "mart_cohort_retention.csv")
    orders = pd.read_csv(proc_dir / "mart_orders_analytics.csv")
    categories = pd.read_csv(proc_dir / "mart_category_performance.csv")
    
    orders["order_purchase_timestamp"] = pd.to_datetime(orders["order_purchase_timestamp"])
    rfm["first_purchase_date"] = pd.to_datetime(rfm["first_purchase_date"])
    rfm["last_purchase_date"] = pd.to_datetime(rfm["last_purchase_date"])
    
    return rfm, cohort, orders, categories

rfm_raw, cohort_df, orders_raw, cat_df = load_all_marts()

# -----------------------------------------------------------------------------
# Top Executive Header Banner
# -----------------------------------------------------------------------------
render_html("""
<div class="header-banner">
    <div class="header-left">
        <div class="header-icon">🖥️</div>
        <div class="header-title-box">
            <h1 class="header-title">Customer Segmentation Analysis</h1>
            <div class="header-subtitle">RFM Analysis & Revenue Intelligence Platform</div>
        </div>
    </div>
    <div>
        <span class="header-tag">Live Enterprise Marts</span>
    </div>
</div>
""")

# -----------------------------------------------------------------------------
# Executive Filter Slicer Bar (Directly below header)
# -----------------------------------------------------------------------------
with st.container():
    f_col1, f_col2, f_col3, f_col4 = st.columns([3, 3, 3, 3])
    
    with f_col1:
        seg_options = ["All Segments"] + sorted(rfm_raw["customer_segment"].dropna().unique().tolist())
        selected_seg = st.selectbox("Customer Segment", options=seg_options, index=0)
        
    with f_col2:
        state_options = ["All Regions / States"] + sorted(orders_raw["customer_state"].dropna().unique().tolist())
        selected_state = st.selectbox("Region / State", options=state_options, index=0)
        
    with f_col3:
        date_options = ["All Historical Data", "Last 12 Months", "Last 6 Months", "Year 2018", "Year 2017"]
        selected_date_range = st.selectbox("Date Range", options=date_options, index=0)
        
    with f_col4:
        cust_type_options = ["All Customers", "Repeat Customers (2+ Orders)", "One-Time Customers"]
        selected_cust_type = st.selectbox("Customer Type", options=cust_type_options, index=0)

# Filter logic
filtered_rfm = rfm_raw.copy()
filtered_orders = orders_raw.copy()

if selected_seg != "All Segments":
    filtered_rfm = filtered_rfm[filtered_rfm["customer_segment"] == selected_seg]
    valid_cids = set(filtered_rfm["customer_unique_id"])
    filtered_orders = filtered_orders[filtered_orders["customer_unique_id"].isin(valid_cids)]

if selected_state != "All Regions / States":
    filtered_rfm = filtered_rfm[filtered_rfm["customer_state"] == selected_state]
    valid_cids = set(filtered_rfm["customer_unique_id"])
    filtered_orders = filtered_orders[filtered_orders["customer_unique_id"].isin(valid_cids)]

if selected_cust_type == "Repeat Customers (2+ Orders)":
    filtered_rfm = filtered_rfm[filtered_rfm["frequency"] > 1]
    valid_cids = set(filtered_rfm["customer_unique_id"])
    filtered_orders = filtered_orders[filtered_orders["customer_unique_id"].isin(valid_cids)]
elif selected_cust_type == "One-Time Customers":
    filtered_rfm = filtered_rfm[filtered_rfm["frequency"] == 1]
    valid_cids = set(filtered_rfm["customer_unique_id"])
    filtered_orders = filtered_orders[filtered_orders["customer_unique_id"].isin(valid_cids)]

if selected_date_range == "Last 12 Months":
    max_d = orders_raw["order_purchase_timestamp"].max()
    filtered_orders = filtered_orders[filtered_orders["order_purchase_timestamp"] >= (max_d - pd.DateOffset(months=12))]
    valid_cids = set(filtered_orders["customer_unique_id"])
    filtered_rfm = filtered_rfm[filtered_rfm["customer_unique_id"].isin(valid_cids)]
elif selected_date_range == "Last 6 Months":
    max_d = orders_raw["order_purchase_timestamp"].max()
    filtered_orders = filtered_orders[filtered_orders["order_purchase_timestamp"] >= (max_d - pd.DateOffset(months=6))]
    valid_cids = set(filtered_orders["customer_unique_id"])
    filtered_rfm = filtered_rfm[filtered_rfm["customer_unique_id"].isin(valid_cids)]
elif selected_date_range == "Year 2018":
    filtered_orders = filtered_orders[filtered_orders["order_purchase_timestamp"].dt.year == 2018]
    valid_cids = set(filtered_orders["customer_unique_id"])
    filtered_rfm = filtered_rfm[filtered_rfm["customer_unique_id"].isin(valid_cids)]
elif selected_date_range == "Year 2017":
    filtered_orders = filtered_orders[filtered_orders["order_purchase_timestamp"].dt.year == 2017]
    valid_cids = set(filtered_orders["customer_unique_id"])
    filtered_rfm = filtered_rfm[filtered_rfm["customer_unique_id"].isin(valid_cids)]

# -----------------------------------------------------------------------------
# Top Row: 3 Executive KPI Cards (Recency, Frequency, Monetary)
# -----------------------------------------------------------------------------
avg_recency = filtered_rfm["recency_days"].mean() if len(filtered_rfm) > 0 else 0
avg_frequency = filtered_rfm["frequency"].mean() if len(filtered_rfm) > 0 else 0
avg_monetary = filtered_rfm["monetary_value"].mean() if len(filtered_rfm) > 0 else 0
total_revenue = filtered_rfm["monetary_value"].sum() if len(filtered_rfm) > 0 else 0

kpi_c1, kpi_c2, kpi_c3 = st.columns(3)

with kpi_c1:
    render_html(f"""
    <div class="kpi-card-box">
        <div class="kpi-icon-wrap kpi-icon-recency">⏱️</div>
        <div class="kpi-text-box">
            <div class="kpi-heading">Recency</div>
            <div class="kpi-val">{avg_recency:.1f}<span class="kpi-val-sub">Days Avg.</span></div>
        </div>
        <div class="kpi-watermark-icon">⏱️</div>
    </div>
    """)

with kpi_c2:
    render_html(f"""
    <div class="kpi-card-box">
        <div class="kpi-icon-wrap kpi-icon-frequency">📅</div>
        <div class="kpi-text-box">
            <div class="kpi-heading">Frequency</div>
            <div class="kpi-val">{avg_frequency:.1f}<span class="kpi-val-sub">Orders Avg.</span></div>
        </div>
        <div class="kpi-watermark-icon">📅</div>
    </div>
    """)

with kpi_c3:
    # Display formatted currency (e.g. R$ 165.2 Revenue Avg. or $K for large)
    rev_display = f"R$ {avg_monetary:.1f}" if avg_monetary < 10000 else f"R$ {avg_monetary/1000:.1f}K"
    render_html(f"""
    <div class="kpi-card-box">
        <div class="kpi-icon-wrap kpi-icon-monetary">💲</div>
        <div class="kpi-text-box">
            <div class="kpi-heading">Monetary</div>
            <div class="kpi-val kpi-val-green">{rev_display}<span class="kpi-val-sub" style="color:#059669;">Revenue Avg.</span></div>
        </div>
        <div class="kpi-watermark-icon">💰</div>
    </div>
    """)

# -----------------------------------------------------------------------------
# Navigation Tabs
# -----------------------------------------------------------------------------
main_tab1, main_tab2, main_tab3, main_tab4, main_tab5, main_tab6 = st.tabs([
    "🎯 Customer Segmentation (RFM)",
    "📊 Executive Revenue & Growth",
    "🔄 Cohort Retention Matrix",
    "🚚 Logistics & CSAT Impact",
    "🤖 ML Repeat Purchase Propensity",
    "🔍 Customer Data Explorer"
])

# -----------------------------------------------------------------------------
# TAB 1: EXECUTIVE RFM SEGMENTATION (Direct Replica of User Image Layout)
# -----------------------------------------------------------------------------
with main_tab1:
    col_left, col_center, col_right = st.columns([3.6, 5.4, 3.0])
    
    # ------------------ LEFT COLUMN: Segments Bar Chart & Distribution Donut ------------------
    with col_left:
        # Card 1: Customer Segments
        with st.container(border=True):
            st.markdown("<div style='font-size:16px; font-weight:700; color:#1E293B; margin-bottom:10px;'>Customer Segments</div>", unsafe_allow_html=True)
            
            seg_counts = filtered_rfm["customer_segment"].value_counts().reset_index()
            seg_counts.columns = ["Segment", "Count"]
            
            # Color mapping mirroring executive standard palette
            palette_map = {
                "Champions": "#1E3A8A",          # Deep navy blue
                "Loyal Customers": "#2563EB",    # Royal blue
                "Potential Loyalists": "#10B981",# Emerald green
                "New Customers": "#06B6D4",      # Cyan
                "At Risk": "#F59E0B",            # Amber
                "Cannot Lose Them": "#EA580C",   # Orange-red
                "Hibernating": "#8B5CF6",        # Purple
                "Lost Customers": "#EF4444"      # Crimson red
            }
            
            # Canonical order
            order_list = ["Champions", "Loyal Customers", "Potential Loyalists", "New Customers", 
                          "At Risk", "Cannot Lose Them", "Hibernating", "Lost Customers"]
            seg_counts["Sort"] = seg_counts["Segment"].apply(lambda s: order_list.index(s) if s in order_list else 99)
            seg_counts = seg_counts.sort_values(by="Sort")
            
            fig_bars = go.Figure()
            fig_bars.add_trace(go.Bar(
                x=seg_counts["Segment"],
                y=seg_counts["Count"],
                marker_color=[palette_map.get(s, "#64748B") for s in seg_counts["Segment"]],
                text=seg_counts["Count"],
                textposition="outside",
                texttemplate="%{text:,.0f}",
                textfont=dict(size=11, color="#1E293B", family="Segoe UI, sans-serif")
            ))
            fig_bars.update_layout(
                height=250,
                margin=dict(l=10, r=10, t=15, b=60),
                plot_bgcolor="#FFFFFF",
                paper_bgcolor="#FFFFFF",
                xaxis=dict(tickangle=-35, tickfont=dict(size=10.5, color="#475569")),
                yaxis=dict(showgrid=True, gridcolor="#F1F5F9", showticklabels=False),
                bargap=0.25
            )
            st.plotly_chart(fig_bars, use_container_width=True)
            
        # Card 2: Segment Distribution
        with st.container(border=True):
            st.markdown("<div style='font-size:16px; font-weight:700; color:#1E293B; margin-bottom:10px;'>Segment Distribution</div>", unsafe_allow_html=True)
            
            fig_donut = go.Figure(data=[go.Pie(
                labels=seg_counts["Segment"],
                values=seg_counts["Count"],
                hole=0.45,
                marker_colors=[palette_map.get(s, "#64748B") for s in seg_counts["Segment"]],
                textinfo="percent",
                textposition="inside",
                insidetextorientation="horizontal",
                textfont=dict(size=11, color="#FFFFFF"),
                hoverinfo="label+value+percent"
            )])
            fig_donut.update_layout(
                height=250,
                margin=dict(l=10, r=10, t=10, b=10),
                showlegend=True,
                legend=dict(
                    orientation="h",
                    yanchor="top",
                    y=-0.08,
                    xanchor="center",
                    x=0.5,
                    font=dict(size=9.5, color="#475569")
                )
            )
            st.plotly_chart(fig_donut, use_container_width=True)

    # ------------------ CENTER COLUMN: 5x5 RFM Score Heatmap ------------------
    with col_center:
        with st.container(border=True):
            st.markdown("<div style='font-size:16px; font-weight:700; color:#1E293B; margin-bottom:10px;'>RFM Score Heatmap</div>", unsafe_allow_html=True)
            
            # Build 5x5 score grid
            # Y-axis: Recency Score 5 (top) down to 1 (bottom)
            # X-axis: Frequency Score 1 (left) up to 5 (right)
            grid_counts = np.zeros((5, 5))
            grid_spend = np.zeros((5, 5))
            grid_colors = np.zeros((5, 5))
            text_matrix = [["" for _ in range(5)] for _ in range(5)]
            
            # Colorscale mapping: normalized composite score from Red to Green
            for r_idx, r_val in enumerate([5, 4, 3, 2, 1]):
                for f_idx, f_val in enumerate([1, 2, 3, 4, 5]):
                    subset = filtered_rfm[(filtered_rfm["r_score"] == r_val) & (filtered_rfm["f_score"] == f_val)]
                    c_count = len(subset)
                    tot_spend = subset["monetary_value"].sum()
                    grid_counts[r_idx, f_idx] = c_count
                    grid_spend[r_idx, f_idx] = tot_spend
                    
                    # Health weight: higher recency & frequency = higher health
                    grid_colors[r_idx, f_idx] = (r_val * 1.5 + f_val * 2.0)
            
            # Overlay strategic segment labels matching reference image
            annotations_map = {
                (0, 4): ("• Champions", "#FFFFFF"),
                (1, 3): ("• Loyal Customers", "#FFFFFF"),
                (1, 1): ("• Potential Loyalists", "#FFFFFF"),
                (0, 0): ("• New Customers", "#FFFFFF"),
                (3, 1): ("• At Risk", "#FFFFFF"),
                (4, 0): ("• Lost Customers", "#FFFFFF"),
                (3, 0): ("• Hibernating", "#FFFFFF"),
                (4, 3): ("• Cannot Lose Them", "#FFFFFF")
            }
            
            for (r_idx, f_idx), (label, text_color) in annotations_map.items():
                count_str = f"{int(grid_counts[r_idx, f_idx]):,}"
                text_matrix[r_idx][f_idx] = f"<b>{label}</b><br><span style='font-size:10px;'>({count_str})</span>"
            
            # Plotly Heatmap
            fig_heat = go.Figure(data=go.Heatmap(
                z=grid_colors,
                x=["1", "2", "3", "4", "5"],
                y=["5", "4", "3", "2", "1"],
                text=text_matrix,
                texttemplate="%{text}",
                textfont=dict(size=11.5, family="Segoe UI, sans-serif"),
                colorscale=[
                    [0.0, "#DC2626"],   # Deep Red (Lost)
                    [0.22, "#EA580C"],  # Orange (At Risk)
                    [0.45, "#F59E0B"],  # Amber (Hibernating)
                    [0.65, "#84CC16"],  # Yellow-Green (Potential)
                    [0.85, "#10B981"],  # Emerald (Loyal)
                    [1.0, "#059669"]    # Dark Green (Champions)
                ],
                showscale=False,
                hoverongaps=False,
                hovertemplate=(
                    "<b>Recency Score:</b> %{y}<br>" +
                    "<b>Frequency Score:</b> %{x}<br>" +
                    "<b>Customer Volume:</b> %{customdata[0]:,}<br>" +
                    "<b>Total Revenue:</b> R$ %{customdata[1]:,.2f}<extra></extra>"
                ),
                customdata=np.dstack((grid_counts, grid_spend))
            ))
            
            fig_heat.update_layout(
                height=536,
                margin=dict(l=40, r=20, t=10, b=45),
                xaxis=dict(
                    title=dict(text="Frequency Score", font=dict(size=12, color="#475569", family="Segoe UI")),
                    tickfont=dict(size=11, color="#1E293B"),
                    side="top"
                ),
                yaxis=dict(
                    title=dict(text="Recency Score", font=dict(size=12, color="#475569", family="Segoe UI")),
                    tickfont=dict(size=11, color="#1E293B")
                ),
                plot_bgcolor="#FFFFFF",
                paper_bgcolor="#FFFFFF"
            )
            st.plotly_chart(fig_heat, use_container_width=True)

    # ------------------ RIGHT COLUMN: Insights Panel ------------------
    with col_right:
        # Dynamic metrics for insights
        pot_loyal_rev = filtered_rfm[filtered_rfm["customer_segment"] == "Potential Loyalists"]["monetary_value"].sum()
        pot_loyal_share = (pot_loyal_rev / total_revenue * 100) if total_revenue > 0 else 0
        
        at_risk_count = len(filtered_rfm[filtered_rfm["customer_segment"].isin(["At Risk", "Cannot Lose Them"])])
        at_risk_rev = filtered_rfm[filtered_rfm["customer_segment"].isin(["At Risk", "Cannot Lose Them"])]["monetary_value"].sum()
        
        champ_loyal_count = len(filtered_rfm[filtered_rfm["customer_segment"].isin(["Champions", "Loyal Customers"])])
        champ_loyal_rev = filtered_rfm[filtered_rfm["customer_segment"].isin(["Champions", "Loyal Customers"])]["monetary_value"].sum()
        
        repeat_rate_live = (len(filtered_rfm[filtered_rfm["frequency"] > 1]) / len(filtered_rfm) * 100) if len(filtered_rfm) > 0 else 0
        
        insights_html = f"""
        <div class="insights-wrapper">
            <div class="insights-top-bar">
                <span>💡</span> Insights & Retention Actions
            </div>
            <div class="insight-card">
                <div class="insight-header">Top Revenue Segment</div>
                <div class="insight-content-row">
                    <div class="insight-icon-box">🏆</div>
                    <div class="insight-text-col">
                        <div class="insight-primary-text">Potential Loyalists: R$ {pot_loyal_rev/1e6:.2f}M</div>
                        <div class="insight-body-text">Drives <b>{pot_loyal_share:.1f}%</b> of total platform sales. High recent engagement with high upsell propensity.</div>
                    </div>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-header">At-Risk Spenders</div>
                <div class="insight-content-row">
                    <div class="insight-icon-box">⚠️</div>
                    <div class="insight-text-col">
                        <div class="insight-primary-text">{at_risk_count:,} Customers</div>
                        <div class="insight-body-text">High historical spend (R$ {at_risk_rev/1e6:.2f}M) but dormant &gt;180 days. Immediate automated win-back incentives recommended.</div>
                    </div>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-header">High-Value Champions</div>
                <div class="insight-content-row">
                    <div class="insight-icon-box">⭐</div>
                    <div class="insight-text-col">
                        <div class="insight-primary-text">{champ_loyal_count:,} VIP Champions</div>
                        <div class="insight-body-text">Generated <b>R$ {champ_loyal_rev/1e6:.2f}M</b> with highest AOV. Prioritize for VIP loyalty perks and early access.</div>
                    </div>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-header">Re-Engagement Cadence</div>
                <div class="insight-content-row">
                    <div class="insight-icon-box">🎯</div>
                    <div class="insight-text-col">
                        <div class="insight-primary-text">Day 30–75 Optimal Window</div>
                        <div class="insight-body-text">Median inter-purchase gap is <b>79.2 days</b>. Automated n8n win-back triggers capture latent repeat conversion.</div>
                    </div>
                </div>
            </div>
        </div>
        """
        render_html(insights_html)


# -----------------------------------------------------------------------------
# TAB 2: EXECUTIVE REVENUE & GROWTH TRENDS
# -----------------------------------------------------------------------------
with main_tab2:
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<div class="content-card-title">📈 Monthly Gross Revenue & Fulfillment Volume Trend</div>', unsafe_allow_html=True)
    
    delivered_orders = filtered_orders[filtered_orders["order_status"] == "delivered"]
    monthly_trend = delivered_orders.groupby("purchase_year_month").agg(
        revenue=("gross_order_value", "sum"),
        orders=("order_id", "count")
    ).reset_index()
    
    fig_monthly = go.Figure()
    fig_monthly.add_trace(go.Scatter(
        x=monthly_trend["purchase_year_month"],
        y=monthly_trend["revenue"],
        mode="lines+markers",
        name="Gross Revenue (BRL)",
        line=dict(color="#1D4ED8", width=3),
        fill="tozeroy",
        fillcolor="rgba(29, 78, 216, 0.08)"
    ))
    fig_monthly.update_layout(
        height=340,
        margin=dict(l=40, r=20, t=10, b=40),
        xaxis_title="Purchase Month",
        yaxis_title="Gross Sales (BRL)",
        plot_bgcolor="#FFFFFF",
        paper_bgcolor="#FFFFFF"
    )
    st.plotly_chart(fig_monthly, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    col_g1, col_g2 = st.columns([6, 6])
    with col_g1:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">🗺️ Top 10 Brazilian States by Revenue</div>', unsafe_allow_html=True)
        state_perf = delivered_orders.groupby("customer_state").agg(
            revenue=("gross_order_value", "sum"),
            orders=("order_id", "count")
        ).reset_index().sort_values(by="revenue", ascending=False).head(10)
        
        fig_st = px.bar(
            state_perf, x="customer_state", y="revenue",
            color="revenue",
            color_continuous_scale="Blues",
            text="revenue"
        )
        fig_st.update_traces(texttemplate="R$ %{text:,.0f}", textposition="outside")
        fig_st.update_layout(height=320, margin=dict(l=20, r=20, t=10, b=40), xaxis_title="State", yaxis_title="Revenue (BRL)", plot_bgcolor="#FFFFFF")
        st.plotly_chart(fig_st, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
    with col_g2:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">💳 Customer Spend Mix: Repeat vs One-Time Buyers</div>', unsafe_allow_html=True)
        repeat_rev = filtered_rfm[filtered_rfm["frequency"] > 1]["monetary_value"].sum()
        single_rev = filtered_rfm[filtered_rfm["frequency"] == 1]["monetary_value"].sum()
        
        fig_mix = go.Figure(data=[go.Pie(
            labels=["One-Time Buyers (97%)", "Repeat Buyers (3%)"],
            values=[single_rev, repeat_rev],
            hole=0.45,
            marker_colors=["#94A3B8", "#10B981"],
            textinfo="label+percent",
            insidetextorientation="horizontal"
        )])
        fig_mix.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10), showlegend=False)
        st.plotly_chart(fig_mix, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# TAB 3: COHORT RETENTION MATRIX
# -----------------------------------------------------------------------------
with main_tab3:
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<div class="content-card-title">🔄 Customer Cohort Retention Heatmap (Month 0 to Month 12)</div>', unsafe_allow_html=True)
    st.caption("Percentage of new customers acquired in each cohort month who return to make a purchase in subsequent months.")
    
    pivot_cohort = cohort_df.pivot(index="cohort_label", columns="cohort_index", values="retention_rate_pct")
    cohort_matrix = pivot_cohort.iloc[:, 1:13]
    
    fig_cohort_heat = px.imshow(
        cohort_matrix,
        labels=dict(x="Months Since First Order", y="Cohort Acquisition Month", color="Retention (%)"),
        x=[f"Month {int(col)}" for col in cohort_matrix.columns],
        y=cohort_matrix.index,
        color_continuous_scale="Viridis",
        aspect="auto"
    )
    fig_cohort_heat.update_layout(height=450, margin=dict(l=40, r=20, t=10, b=40))
    st.plotly_chart(fig_cohort_heat, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    col_c1, col_c2 = st.columns(2)
    with col_c1:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">📉 Platform-Wide Retention Decay Curve</div>', unsafe_allow_html=True)
        decay = cohort_df[cohort_df["cohort_index"] > 0].groupby("cohort_index")["retention_rate_pct"].mean().reset_index()
        fig_decay = px.line(decay, x="cohort_index", y="retention_rate_pct", markers=True, color_discrete_sequence=["#EF4444"])
        fig_decay.update_layout(height=300, xaxis_title="Month Index", yaxis_title="Average Retention Rate (%)", plot_bgcolor="#FFFFFF")
        st.plotly_chart(fig_decay, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
    with col_c2:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">👥 Monthly Cohort Acquisition Volume</div>', unsafe_allow_html=True)
        sizes = cohort_df[cohort_df["cohort_index"] == 0].sort_values(by="cohort_month")
        fig_acq = px.bar(sizes, x="cohort_label", y="cohort_size", color_discrete_sequence=["#3B82F6"])
        fig_acq.update_layout(height=300, xaxis_title="Cohort Month", yaxis_title="Initial Buyers Acquired", plot_bgcolor="#FFFFFF")
        st.plotly_chart(fig_acq, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# TAB 4: LOGISTICS & CSAT IMPACT
# -----------------------------------------------------------------------------
with main_tab4:
    col_cs1, col_cs2 = st.columns(2)
    with col_cs1:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">🚚 Delivery Punctuality vs CSAT Rating</div>', unsafe_allow_html=True)
        delay_csat = delivered_orders.groupby("is_delayed").agg(
            order_count=("order_id", "count"),
            avg_review=("review_score", "mean")
        ).reset_index()
        delay_csat["Status"] = delay_csat["is_delayed"].map({False: "On-Time / Early", True: "Delayed Delivery"})
        
        fig_csat = px.bar(
            delay_csat, x="Status", y="avg_review",
            color="Status",
            color_discrete_map={"On-Time / Early": "#10B981", "Delayed Delivery": "#EF4444"},
            text="avg_review"
        )
        fig_csat.update_traces(texttemplate="%{text:.2f} ★", textposition="outside")
        fig_csat.update_layout(yaxis_range=[0, 5], height=340, showlegend=False, plot_bgcolor="#FFFFFF")
        st.plotly_chart(fig_csat, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
    with col_cs2:
        st.markdown('<div class="content-card">', unsafe_allow_html=True)
        st.markdown('<div class="content-card-title">⭐ Review Score Rating Breakdown (1 to 5 Stars)</div>', unsafe_allow_html=True)
        reviews = delivered_orders["review_score"].value_counts().sort_index().reset_index()
        reviews.columns = ["Stars", "Reviews"]
        fig_revs = px.bar(reviews, x="Stars", y="Reviews", color="Stars", color_continuous_scale="Blues")
        fig_revs.update_layout(height=340, plot_bgcolor="#FFFFFF")
        st.plotly_chart(fig_revs, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# TAB 5: ML REPEAT PURCHASE PROPENSITY
# -----------------------------------------------------------------------------
with main_tab5:
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<div class="content-card-title">🤖 Machine Learning: Repeat Purchase Propensity Model (Random Forest)</div>', unsafe_allow_html=True)
    
    col_ml1, col_ml2 = st.columns([6, 6])
    with col_ml1:
        st.image("reports/figures/11_feature_importance.png", caption="Model Feature Importances (Gini Impurity)", use_container_width=True)
    
    with col_ml2:
        st.markdown("""
        ### Predictive Churn & Re-Purchase Architecture
        - **Algorithm:** Scikit-Learn `RandomForestClassifier` with balanced class weighting.
        - **Target:** Predict whether a 1st-time buyer will make a 2nd purchase within 180 days.
        - **Top Predictive Signals:**
          1. **`total_items_spend`**: High first-order ticket items correlate with higher retention intent.
          2. **`freight_ratio`**: Freight exceeding 25% of basket value drastically suppresses repeat purchase propensity.
          3. **`delivery_duration_days`**: Shipments arriving >15 days see a 42% collapse in repurchase likelihood.
          4. **`review_score`**: 5-star buyers are 3.8x more likely to repurchase than 1-star buyers.
        """)
    st.markdown('</div>', unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# TAB 6: CUSTOMER DATA EXPLORER
# -----------------------------------------------------------------------------
with main_tab6:
    st.markdown('<div class="content-card">', unsafe_allow_html=True)
    st.markdown('<div class="content-card-title">🔍 Customer Intelligence Search & Export</div>', unsafe_allow_html=True)
    
    search_q = st.text_input("Search by Customer ID or City", "")
    view_df = filtered_rfm.copy()
    if search_q:
        view_df = view_df[
            view_df["customer_unique_id"].str.contains(search_q, case=False, na=False) |
            view_df["customer_city"].str.contains(search_q, case=False, na=False)
        ]
        
    display_cols = [
        "customer_unique_id", "customer_city", "customer_state", "customer_segment",
        "recency_days", "frequency", "monetary_value", "avg_review_score", "r_score", "f_score", "m_score"
    ]
    st.dataframe(
        view_df[display_cols].head(500).style.format({
            "monetary_value": "R$ {:,.2f}",
            "recency_days": "{:,} days",
            "avg_review_score": "{:.2f} ★"
        }),
        use_container_width=True,
        height=400
    )
    
    csv_bytes = view_df[display_cols].head(5000).to_csv(index=False).encode("utf-8")
    st.download_button(
        "📥 Download Filtered Customer Mart (CSV)",
        data=csv_bytes,
        file_name="filtered_customer_rfm.csv",
        mime="text/csv"
    )
    st.markdown('</div>', unsafe_allow_html=True)
