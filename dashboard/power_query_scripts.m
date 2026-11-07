// ====================================================================
// Power Query M Scripts for Power BI Desktop
// Paste each query into Power Query Editor -> Advanced Editor
// ====================================================================

// --------------------------------------------------------------------
// Query 1: dim_customer_rfm
// --------------------------------------------------------------------
let
    Source = Csv.Document(File.Contents(Text.Combine({SourceFolderPath, "mart_customer_rfm.csv"})), [Delimiter=",", Columns=18, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"customer_unique_id", type text},
        {"customer_city", type text},
        {"customer_state", type text},
        {"first_purchase_date", type datetime},
        {"last_purchase_date", type datetime},
        {"recency_days", Int64.Type},
        {"frequency", Int64.Type},
        {"total_items_spend", type number},
        {"total_freight_spend", type number},
        {"monetary_value", type number},
        {"avg_review_score", type number},
        {"delayed_orders_count", Int64.Type},
        {"r_score", Int64.Type},
        {"f_score", Int64.Type},
        {"m_score", Int64.Type},
        {"rfm_code", type text},
        {"customer_segment", type text},
        {"customer_type", type text}
    })
in
    #"Changed Type"

// --------------------------------------------------------------------
// Query 2: dim_cohort
// --------------------------------------------------------------------
let
    Source = Csv.Document(File.Contents(Text.Combine({SourceFolderPath, "mart_cohort_retention.csv"})), [Delimiter=",", Columns=7, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"cohort_month", type date},
        {"cohort_label", type text},
        {"cohort_size", Int64.Type},
        {"cohort_index", Int64.Type},
        {"active_customers", Int64.Type},
        {"retention_rate_pct", type number},
        {"cohort_revenue", type number}
    })
in
    #"Changed Type"

// --------------------------------------------------------------------
// Query 3: fact_orders
// --------------------------------------------------------------------
let
    Source = Csv.Document(File.Contents(Text.Combine({SourceFolderPath, "mart_orders_analytics.csv"})), [Delimiter=",", Columns=23, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"order_id", type text},
        {"customer_unique_id", type text},
        {"customer_city", type text},
        {"customer_state", type text},
        {"order_status", type text},
        {"order_purchase_timestamp", type datetime},
        {"purchase_year", Int64.Type},
        {"purchase_month", Int64.Type},
        {"purchase_year_month", type text},
        {"purchase_day_name", type text},
        {"purchase_hour", Int64.Type},
        {"order_delivered_customer_date", type datetime},
        {"order_estimated_delivery_date", type datetime},
        {"delivery_duration_days", type number},
        {"delivery_delay_days", type number},
        {"is_delayed", type logical},
        {"review_score", Int64.Type},
        {"item_count", Int64.Type},
        {"items_value", type number},
        {"freight_value", type number},
        {"gross_order_value", type number},
        {"payment_methods", type text},
        {"payment_value", type number}
    })
in
    #"Changed Type"

// --------------------------------------------------------------------
// Query 4: dim_category_performance
// --------------------------------------------------------------------
let
    Source = Csv.Document(File.Contents(Text.Combine({SourceFolderPath, "mart_category_performance.csv"})), [Delimiter=",", Columns=10, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"category", type text},
        {"total_orders", Int64.Type},
        {"total_units_sold", Int64.Type},
        {"total_merchandise_revenue", type number},
        {"total_freight_revenue", type number},
        {"total_gross_revenue", type number},
        {"avg_item_price", type number},
        {"avg_review_score", type number},
        {"avg_delivery_days", type number},
        {"delay_rate_pct", type number}
    })
in
    #"Changed Type"

