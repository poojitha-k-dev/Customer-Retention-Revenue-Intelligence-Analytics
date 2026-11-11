export interface KPISummary {
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  repeat_customers: number;
  repeat_purchase_rate: number;
  avg_order_value: number;
  avg_customer_ltv: number;
  avg_recency_days: number;
  avg_review_score: number;
  on_time_delivery_rate: number;
}

export interface RFMSegmentMetric {
  customer_segment: string;
  total_customers: number;
  customer_share_pct: number;
  avg_recency_days: number;
  avg_frequency: number;
  avg_monetary_value: number;
  total_segment_revenue: number;
  revenue_share_pct: number;
  color?: string;
}

export interface CohortCell {
  cohort_month: string;
  cohort_label: string;
  cohort_size: number;
  cohort_index: number;
  active_customers: number;
  retention_rate_pct: number;
}

export interface CategoryMetric {
  category: string;
  total_orders: number;
  total_gross_revenue: number;
  avg_review_score: number;
  revenue_share_pct: number;
}

export interface CustomerRecord {
  customer_unique_id: string;
  customer_city: string;
  customer_state: string;
  recency_days: number;
  frequency: number;
  monetary_value: number;
  avg_review_score: number;
  customer_segment: string;
  r_score: number;
  f_score: number;
  m_score: number;
  customer_type: string;
}

export interface PipelineStatus {
  service_status: string;
  database_status: string;
  raw_dataset_verified: boolean;
  clean_marts_ready: boolean;
  last_execution_timestamp: string;
  total_records_analyzed: number;
  ml_model_status: string;
}

export type PageId =
  | 'overview'
  | 'customer-analytics'
  | 'retention-cohort'
  | 'rfm-segmentation'
  | 'purchase-behaviour'
  | 'business-insights'
  | 'data-pipeline'
  | 'data-explorer';
