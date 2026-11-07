"""Interactive Customer Retention & Revenue Intelligence Platform Dashboard.

A production-grade Streamlit application providing real-time exploration
of the Olist Brazilian E-Commerce data marts.
"""

import sys
from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Ensure project root in path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Page configuration
st.set_page_config(
    page_title="Customer Retention & Revenue Intelligence Platform",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for executive cards & styling
st.markdown("""
<style>
    .metric-card {
        background-color: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 18px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .metric-label {
        font-size: 13px;
        color: #64748B;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .metric-val {
        font-size: 26px;
        font-weight: 700;
        color: #0F172A;
        margin-top: 4px;
    }
    .metric-sub {
        font-size: 12px;
        color: #10B981;
        margin-top: 2px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def load_data():
    proc_dir = ROOT_DIR / "data" / "processed"
    rfm = pd.read_csv(proc_dir / "mart_customer_rfm.csv")
    cohort = pd.read_csv(proc_dir / "mart_cohort_retention.csv")
    orders = pd.read_csv(proc_dir / "mart_orders_analytics.csv")
    categories = pd.read_csv(proc_dir / "mart_category_performance.csv")
    
    orders["order_purchase_timestamp"] = pd.to_datetime(orders["order_purchase_timestamp"])
    rfm["first_purchase_date"] = pd.to_datetime(rfm["first_purchase_date"])
    rfm["last_purchase_date"] = pd.to_datetime(rfm["last_purchase_date"])
    
    return rfm, cohort, orders, categories

rfm_df, cohort_df, orders_df, cat_df = load_data()

# Sidebar filters
st.sidebar.image("https://img.icons8.com/fluency/96/combo-chart.png", width=64)
st.sidebar.title("Analytics Filters")

selected_states = st.sidebar.multiselect(
    "Filter by Customer State",
    options=sorted(orders_df["customer_state"].dropna().unique()),
    default=[]
)

selected_segments = st.sidebar.multiselect(
    "Filter by RFM Segment",
    options=sorted(rfm_df["customer_segment"].unique()),
    default=[]
)

# Apply filters
filtered_orders = orders_df.copy()
filtered_rfm = rfm_df.copy()

if selected_states:
    filtered_orders = filtered_orders[filtered_orders["customer_state"].isin(selected_states)]
    filtered_rfm = filtered_rfm[filtered_rfm["customer_state"].isin(selected_states)]

if selected_segments:
    valid_cust_ids = set(rfm_df[rfm_df["customer_segment"].isin(selected_segments)]["customer_unique_id"])
    filtered_orders = filtered_orders[filtered_orders["customer_unique_id"].isin(valid_cust_ids)]
    filtered_rfm = filtered_rfm[filtered_rfm["customer_segment"].isin(selected_segments)]

# Header
st.title("📈 Customer Retention & Revenue Intelligence Platform")
st.markdown("**Enterprise Analytics & Decision Support for E-Commerce Growth & Retention**")

# Top KPI Bar
delivered = filtered_orders[filtered_orders["order_status"] == "delivered"]
total_rev = delivered["gross_order_value"].sum()
total_orders = len(delivered)
total_cust = filtered_rfm["customer_unique_id"].nunique()
repeat_cust = (filtered_rfm["frequency"] > 1).sum()
repeat_rate = (repeat_cust / total_cust * 100) if total_cust > 0 else 0
aov = (total_rev / total_orders) if total_orders > 0 else 0
arpu = (total_rev / total_cust) if total_cust > 0 else 0

c1, c2, c3, c4, c5, c6 = st.columns(6)
with c1:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Gross Revenue</div><div class="metric-val">R$ {total_rev/1e6:.2f}M</div><div class="metric-sub">Realized Sales</div></div>', unsafe_allow_html=True)
with c2:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Delivered Orders</div><div class="metric-val">{total_orders:,}</div><div class="metric-sub">Fulfillment Done</div></div>', unsafe_allow_html=True)
with c3:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Unique Customers</div><div class="metric-val">{total_cust:,}</div><div class="metric-sub">Unique Buyers</div></div>', unsafe_allow_html=True)
with c4:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Repeat Rate</div><div class="metric-val">{repeat_rate:.2f}%</div><div class="metric-sub">{repeat_cust:,} Repeat Buyers</div></div>', unsafe_allow_html=True)
with c5:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Average Order Val</div><div class="metric-val">R$ {aov:.2f}</div><div class="metric-sub">Basket Size</div></div>', unsafe_allow_html=True)
with c6:
    st.markdown(f'<div class="metric-card"><div class="metric-label">Avg Customer Rev</div><div class="metric-val">R$ {arpu:.2f}</div><div class="metric-sub">LTV per Customer</div></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Executive Overview",
    "🔄 Customer Retention",
    "🎯 RFM Segmentation",
    "🚚 Logistics & CSAT",
    "💰 Revenue Intelligence"
])

# ---------------------------------------------------------------------
# Tab 1: Executive Overview
# ---------------------------------------------------------------------
with tab1:
    col_l, col_r = st.columns([7, 5])
    
    with col_l:
        st.subheader("Monthly Gross Revenue & Order Volume Trend")
        monthly = delivered.groupby("purchase_year_month").agg(
            revenue=("gross_order_value", "sum"),
            orders=("order_id", "count")
        ).reset_index()
        
        fig_rev = px.area(
            monthly, x="purchase_year_month", y="revenue",
            title="Monthly Revenue Trend (BRL)",
            color_discrete_sequence=["#0EA5E9"]
        )
        fig_rev.update_layout(xaxis_title="Purchase Month", yaxis_title="Revenue (BRL)", height=380)
        st.plotly_chart(fig_rev, use_container_width=True)
        
    with col_r:
        st.subheader("Customer Mix: Repeat vs One-Time")
        mix_data = pd.DataFrame({
            "Type": ["One-Time Customer", "Repeat Customer"],
            "Count": [total_cust - repeat_cust, repeat_cust]
        })
        fig_pie = px.pie(
            mix_data, names="Type", values="Count",
            color="Type",
            color_discrete_map={"One-Time Customer": "#94A3B8", "Repeat Customer": "#10B981"},
            hole=0.45
        )
        fig_pie.update_layout(height=380)
        st.plotly_chart(fig_pie, use_container_width=True)
        
    st.subheader("Geographic Demand: Top 10 States by Revenue")
    state_perf = delivered.groupby("customer_state").agg(
        revenue=("gross_order_value", "sum"),
        orders=("order_id", "count")
    ).reset_index().sort_values(by="revenue", ascending=False).head(10)
    
    fig_state = px.bar(
        state_perf, x="customer_state", y="revenue",
        color="revenue",
        color_continuous_scale="Blues",
        labels={"customer_state": "State", "revenue": "Gross Revenue (BRL)"}
    )
    fig_state.update_layout(height=320)
    st.plotly_chart(fig_state, use_container_width=True)

# ---------------------------------------------------------------------
# Tab 2: Customer Retention
# ---------------------------------------------------------------------
with tab2:
    st.subheader("Customer Cohort Retention Matrix (Month 0 to Month 12)")
    st.markdown("Track percentage of initial cohort purchasers who return in subsequent months.")
    
    pivot_cohort = cohort_df.pivot(index="cohort_label", columns="cohort_index", values="retention_rate_pct")
    cohort_matrix = pivot_cohort.iloc[:, 1:13]
    
    fig_heat = px.imshow(
        cohort_matrix,
        labels=dict(x="Months Since First Purchase", y="Cohort Month", color="Retention Rate (%)"),
        x=[f"Month {int(col)}" for col in cohort_matrix.columns],
        y=cohort_matrix.index,
        color_continuous_scale="Viridis",
        aspect="auto"
    )
    fig_heat.update_layout(height=480)
    st.plotly_chart(fig_heat, use_container_width=True)
    
    c_ret1, c_ret2 = st.columns(2)
    with c_ret1:
        st.subheader("Average Retention Decay Curve")
        avg_decay = cohort_df[cohort_df["cohort_index"] > 0].groupby("cohort_index")["retention_rate_pct"].mean().reset_index()
        fig_decay = px.line(
            avg_decay, x="cohort_index", y="retention_rate_pct",
            markers=True,
            title="Platform-Wide Retention Decay by Month Index",
            color_discrete_sequence=["#EF4444"]
        )
        fig_decay.update_layout(xaxis_title="Month Index", yaxis_title="Average Retention Rate (%)", height=350)
        st.plotly_chart(fig_decay, use_container_width=True)
        
    with c_ret2:
        st.subheader("Cohort Acquisition Size Over Time")
        cohort_sizes = cohort_df[cohort_df["cohort_index"] == 0].sort_values(by="cohort_month")
        fig_sizes = px.bar(
            cohort_sizes, x="cohort_label", y="cohort_size",
            title="Monthly New Customer Acquisition Volume",
            color_discrete_sequence=["#3B82F6"]
        )
        fig_sizes.update_layout(xaxis_title="Cohort Month", yaxis_title="Cohort Size (Customers)", height=350)
        st.plotly_chart(fig_sizes, use_container_width=True)

# ---------------------------------------------------------------------
# Tab 3: RFM Customer Segmentation
# ---------------------------------------------------------------------
with tab3:
    st.subheader("Customer Segmentation Overview")
    
    seg_summary = filtered_rfm.groupby("customer_segment").agg(
        customers=("customer_unique_id", "count"),
        total_revenue=("monetary_value", "sum"),
        avg_spend=("monetary_value", "mean"),
        avg_recency=("recency_days", "mean"),
        avg_freq=("frequency", "mean")
    ).reset_index()
    seg_summary["revenue_pct"] = (seg_summary["total_revenue"] / seg_summary["total_revenue"].sum()) * 100
    seg_summary["customer_pct"] = (seg_summary["customers"] / seg_summary["customers"].sum()) * 100
    
    col_t1, col_t2 = st.columns([6, 6])
    with col_t1:
        fig_seg_rev = px.bar(
            seg_summary.sort_values(by="total_revenue", ascending=True),
            x="total_revenue", y="customer_segment",
            orientation="h",
            color="total_revenue",
            color_continuous_scale="Teal",
            title="Gross Revenue Contribution by Customer Segment"
        )
        fig_seg_rev.update_layout(height=400, xaxis_title="Revenue (BRL)", yaxis_title="")
        st.plotly_chart(fig_seg_rev, use_container_width=True)
        
    with col_t2:
        fig_scatter = px.scatter(
            filtered_rfm.sample(min(3000, len(filtered_rfm)), random_state=42),
            x="recency_days", y="monetary_value",
            color="customer_segment",
            size="frequency",
            title="RFM Recency vs Monetary Value Distribution (Sampled)",
            log_y=True
        )
        fig_scatter.update_layout(height=400, xaxis_title="Recency (Days Inactive)", yaxis_title="Monetary Value (Log Scale BRL)")
        st.plotly_chart(fig_scatter, use_container_width=True)
        
    st.subheader("Segment Details & Economics")
    st.dataframe(
        seg_summary.sort_values(by="total_revenue", ascending=False).style.format({
            "customers": "{:,}",
            "total_revenue": "R$ {:,.2f}",
            "avg_spend": "R$ {:,.2f}",
            "avg_recency": "{:.1f} days",
            "avg_freq": "{:.2f}",
            "revenue_pct": "{:.2f}%",
            "customer_pct": "{:.2f}%"
        }),
        use_container_width=True
    )

# ---------------------------------------------------------------------
# Tab 4: Logistics & Customer Experience
# ---------------------------------------------------------------------
with tab4:
    st.subheader("Delivery Punctuality vs Customer Satisfaction (CSAT)")
    
    col_csat1, col_csat2 = st.columns(2)
    with col_csat1:
        delay_csat = delivered.groupby("is_delayed").agg(
            order_count=("order_id", "count"),
            avg_review=("review_score", "mean")
        ).reset_index()
        delay_csat["Status"] = delay_csat["is_delayed"].map({False: "On-Time / Early", True: "Delayed Delivery"})
        
        fig_csat = px.bar(
            delay_csat, x="Status", y="avg_review",
            color="Status",
            color_discrete_map={"On-Time / Early": "#10B981", "Delayed Delivery": "#EF4444"},
            text="avg_review",
            title="Impact of Delivery Delay on Average Review Rating"
        )
        fig_csat.update_traces(texttemplate="%{text:.2f} ★", textposition="outside")
        fig_csat.update_layout(yaxis_range=[0, 5], height=380, showlegend=False)
        st.plotly_chart(fig_csat, use_container_width=True)
        
    with col_csat2:
        rev_dist = delivered["review_score"].value_counts().sort_index().reset_index()
        rev_dist.columns = ["Stars", "Reviews"]
        fig_stars = px.bar(
            rev_dist, x="Stars", y="Reviews",
            color="Stars",
            color_continuous_scale="Blues",
            title="Platform Review Score Breakdown (1 to 5 Stars)"
        )
        fig_stars.update_layout(height=380)
        st.plotly_chart(fig_stars, use_container_width=True)
        
    st.subheader("Delivery Duration Distribution")
    fig_dur = px.histogram(
        delivered[delivered["delivery_duration_days"] <= 60],
        x="delivery_duration_days",
        nbins=60,
        color_discrete_sequence=["#0EA5E9"],
        title="Order Delivery Duration Distribution (Capped at 60 Days)"
    )
    fig_dur.update_layout(xaxis_title="Delivery Duration (Days)", yaxis_title="Order Count", height=320)
    st.plotly_chart(fig_dur, use_container_width=True)

# ---------------------------------------------------------------------
# Tab 5: Revenue Intelligence
# ---------------------------------------------------------------------
with tab5:
    st.subheader("Category Revenue & Satisfaction Performance")
    
    col_p1, col_p2 = st.columns([7, 5])
    with col_p1:
        top_cats = cat_df.sort_values(by="total_gross_revenue", ascending=False).head(15)
        fig_cat = px.bar(
            top_cats, x="total_gross_revenue", y="category",
            orientation="h",
            color="avg_review_score",
            color_continuous_scale="Viridis",
            title="Top 15 Categories by Revenue (Colored by Avg Review Score)"
        )
        fig_cat.update_layout(height=450, xaxis_title="Gross Revenue (BRL)", yaxis_title="")
        st.plotly_chart(fig_cat, use_container_width=True)
        
    with col_p2:
        st.markdown("### Customer Revenue Concentration (Pareto)")
        cust_spends = filtered_rfm["monetary_value"].sort_values(ascending=False).values
        cumulative_rev = np.cumsum(cust_spends) / cust_spends.sum() * 100
        customer_pct = np.linspace(0, 100, len(cust_spends))
        
        fig_pareto = go.Figure()
        fig_pareto.add_trace(go.Scatter(x=customer_pct, y=cumulative_rev, mode="lines", name="Revenue Curve", line=dict(color="#0EA5E9", width=3)))
        fig_pareto.add_trace(go.Scatter(x=[0, 100], y=[0, 100], mode="lines", name="Equality Baseline", line=dict(color="#94A3B8", dash="dash")))
        fig_pareto.update_layout(title="Lorenz Curve / Revenue Concentration", xaxis_title="Percentage of Customers (%)", yaxis_title="Cumulative Revenue (%)", height=450)
        st.plotly_chart(fig_pareto, use_container_width=True)
        
    st.subheader("Top 10 High-Value Customers")
    top_cust = filtered_rfm.sort_values(by="monetary_value", ascending=False).head(10)[
        ["customer_unique_id", "customer_city", "customer_state", "frequency", "monetary_value", "recency_days", "customer_segment"]
    ]
    st.dataframe(
        top_cust.style.format({"monetary_value": "R$ {:,.2f}", "recency_days": "{:,} days"}),
        use_container_width=True
    )
