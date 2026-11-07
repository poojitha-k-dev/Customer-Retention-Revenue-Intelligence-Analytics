# Data Dictionary & Schema Specification
## Customer Retention & Revenue Intelligence Platform

This document provides a comprehensive data catalog for all 8 relational tables in the PostgreSQL `olist_db` warehouse and the derived analytical data marts.

---

## 1. Relational Database Tables (`olist_db`)

### 1.1 `customers`
Stores customer identity, account mapping, and geographic location.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `customer_id` | `VARCHAR(50)` | No | PK | Transactional customer key generated per order. Each order has a unique `customer_id`. |
| `customer_unique_id` | `VARCHAR(50)` | No | Index | Persistent unique identifier of the real individual / CPF citizen account. Used for all retention and RFM metrics. |
| `customer_zip_code_prefix` | `INT` | Yes | - | First 5 digits of the Brazilian postal code (CEP). |
| `customer_city` | `VARCHAR(100)` | Yes | - | Normalized customer city name (title-cased). |
| `customer_state` | `VARCHAR(5)` | Yes | Index | 2-letter Brazilian state abbreviation (e.g., SP, RJ, MG). |

---

### 1.2 `orders`
Core transaction fact table capturing order statuses, fulfillment timestamps, and logistics duration metrics.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `order_id` | `VARCHAR(50)` | No | PK | Unique identifier for each customer purchase transaction. |
| `customer_id` | `VARCHAR(50)` | No | FK | References `customers(customer_id)`. |
| `order_status` | `VARCHAR(20)` | No | Index | Order fulfillment state (`delivered`, `shipped`, `canceled`, `invoiced`, `processing`, `unavailable`, `created`, `approved`). |
| `order_purchase_timestamp` | `TIMESTAMP` | No | Index | Exact timestamp when the order was placed by the customer. |
| `order_approved_at` | `TIMESTAMP` | Yes | - | Timestamp when the payment transaction was authorized. |
| `order_delivered_carrier_date` | `TIMESTAMP` | Yes | - | Timestamp when the seller handed over package to the carrier. |
| `order_delivered_customer_date`| `TIMESTAMP` | Yes | - | Actual timestamp when the package was handed to the customer. |
| `order_estimated_delivery_date`| `TIMESTAMP` | No | - | SLA delivery deadline promised to the customer during checkout. |
| `purchase_year` | `INT` | Yes | - | Year extracted from purchase timestamp (2016, 2017, 2018). |
| `purchase_month` | `INT` | Yes | - | Calendar month (1–12). |
| `purchase_year_month` | `VARCHAR(10)` | Yes | Index | Formatted year-month string (`YYYY-MM`) for cohort grouping. |
| `purchase_day_name` | `VARCHAR(15)` | Yes | - | Day of the week (`Monday`, `Tuesday`, etc.). |
| `purchase_hour` | `INT` | Yes | - | Hour of the day (0–23). |
| `delivery_duration_days` | `NUMERIC(8,2)`| Yes | - | `(delivered_customer_date - purchase_timestamp)` in decimal days. |
| `estimated_duration_days` | `NUMERIC(8,2)`| Yes | - | `(estimated_delivery_date - purchase_timestamp)` in decimal days. |
| `delivery_delay_days` | `NUMERIC(8,2)`| Yes | - | `(delivered_customer_date - estimated_delivery_date)` in days. Positive values indicate late delivery. |
| `is_delayed` | `BOOLEAN` | No | - | Flag set to `TRUE` if delivered after estimated date; default `FALSE`. |

---

### 1.3 `order_items`
Itemized line-item details capturing merchandise prices, freight charges, product IDs, and seller references.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `order_id` | `VARCHAR(50)` | No | PK, FK | References `orders(order_id)`. Part of composite PK. |
| `order_item_id` | `INT` | No | PK | Sequential line-item index within the order (1, 2, 3...). |
| `product_id` | `VARCHAR(50)` | No | FK, Index | References `products(product_id)`. |
| `seller_id` | `VARCHAR(50)` | No | FK, Index | References `sellers(seller_id)`. |
| `shipping_limit_date` | `TIMESTAMP` | Yes | - | Deadline for seller to dispatch package to carrier. |
| `price` | `NUMERIC(10,2)`| No | - | Item merchandise price in Brazilian Reais (BRL); $\ge 0$. |
| `freight_value` | `NUMERIC(10,2)`| No | - | Shipping and handling cost for the specific item (BRL); $\ge 0$. |
| `total_item_value` | `NUMERIC(10,2)`| No | - | Computed sum: `price + freight_value`. |

---

### 1.4 `payments`
Payment transaction records capturing payment methods, installments, and captured amounts.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `order_id` | `VARCHAR(50)` | No | PK, FK | References `orders(order_id)`. Part of composite PK. |
| `payment_sequential` | `INT` | No | PK | Sequential payment attempt/method index (1, 2, 3...). |
| `payment_type` | `VARCHAR(30)` | No | Index | Method (`credit_card`, `boleto`, `voucher`, `debit_card`, `unknown`). |
| `payment_installments` | `INT` | No | - | Number of installments selected by customer (1 = full payment). |
| `payment_value` | `NUMERIC(10,2)`| No | - | Amount charged for this specific payment record in BRL. |

---

### 1.5 `reviews`
Customer survey ratings and optional text feedback.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `review_id` | `VARCHAR(50)` | Yes | - | Review survey identifier. |
| `order_id` | `VARCHAR(50)` | No | PK, FK | References `orders(order_id)`. Deduplicated to 1 review per order. |
| `review_score` | `INT` | No | Index | Customer satisfaction score from 1 (terrible) to 5 (excellent). |
| `review_creation_date` | `TIMESTAMP` | Yes | - | Timestamp when the survey email was dispatched to the customer. |
| `review_answer_timestamp` | `TIMESTAMP` | Yes | - | Timestamp when the customer submitted the completed review. |
| `review_comment_title` | `TEXT` | Yes | - | Optional short title of review. |
| `review_comment_message` | `TEXT` | Yes | - | Optional long-form review message in Portuguese. |

---

### 1.6 `products`
Product catalog dimension with English translated category names and physical package dimensions.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `product_id` | `VARCHAR(50)` | No | PK | Unique product SKU identifier. |
| `product_category_name` | `VARCHAR(100)`| Yes | - | Raw Portuguese category string. |
| `product_category_name_english` | `VARCHAR(100)`| Yes | Index | Clean English translated category name. |
| `product_name_lenght` | `NUMERIC(10,2)`| Yes | - | Character count of product title. |
| `product_description_lenght` | `NUMERIC(10,2)`| Yes | - | Character count of product description. |
| `product_photos_qty` | `NUMERIC(10,2)`| Yes | - | Number of product photos on marketplace listing. |
| `product_weight_g` | `NUMERIC(10,2)`| Yes | - | Package weight in grams. |
| `product_length_cm` | `NUMERIC(10,2)`| Yes | - | Package length in centimeters. |
| `product_height_cm` | `NUMERIC(10,2)`| Yes | - | Package height in centimeters. |
| `product_width_cm` | `NUMERIC(10,2)`| Yes | - | Package width in centimeters. |

---

### 1.7 `sellers`
Seller location and merchant identification dimension.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `seller_id` | `VARCHAR(50)` | No | PK | Unique third-party merchant identifier. |
| `seller_zip_code_prefix` | `INT` | Yes | - | 5-digit Brazilian zip code prefix for seller dispatch center. |
| `seller_city` | `VARCHAR(100)` | Yes | - | Seller registered city. |
| `seller_state` | `VARCHAR(5)` | Yes | Index | 2-letter Brazilian state code. |

---

### 1.8 `geolocation`
Spatial reference table aggregated by zip code prefix for Brazilian coordinate mapping.

| Column Name | Data Type | Nullable | Key | Description / Business Rules |
| :--- | :--- | :---: | :---: | :--- |
| `geolocation_zip_code_prefix` | `INT` | No | PK | Unique 5-digit postal prefix. |
| `latitude` | `NUMERIC(10,6)`| Yes | - | Mean GPS latitude coordinate. |
| `longitude` | `NUMERIC(10,6)`| Yes | - | Mean GPS longitude coordinate. |
| `city` | `VARCHAR(100)` | Yes | - | Dominant city name for zip code prefix. |
| `state` | `VARCHAR(5)` | Yes | - | 2-letter state code. |

---

## 2. Analytical Data Marts (`data/processed/`)

### 2.1 `mart_customer_rfm.csv`
- **Granularity:** 1 row per unique customer (`customer_unique_id`).
- **Rows:** 93,358 rows.
- **Key Columns:** `customer_unique_id`, `recency_days`, `frequency`, `monetary_value`, `r_score`, `f_score`, `m_score`, `rfm_code`, `customer_segment`, `customer_type`.

### 2.2 `mart_cohort_retention.csv`
- **Granularity:** 1 row per `(cohort_month, cohort_index)`.
- **Rows:** 219 rows.
- **Key Columns:** `cohort_month`, `cohort_label`, `cohort_size`, `cohort_index`, `active_customers`, `retention_rate_pct`, `cohort_revenue`.

### 2.3 `mart_orders_analytics.csv`
- **Granularity:** 1 row per order (`order_id`).
- **Rows:** 99,441 rows.
- **Key Columns:** `order_id`, `customer_unique_id`, `order_status`, `order_purchase_timestamp`, `purchase_year_month`, `delivery_duration_days`, `delivery_delay_days`, `is_delayed`, `review_score`, `items_value`, `freight_value`, `gross_order_value`.

### 2.4 `mart_category_performance.csv`
- **Granularity:** 1 row per translated product category.
- **Rows:** 74 rows.
- **Key Columns:** `category`, `total_orders`, `total_units_sold`, `total_gross_revenue`, `avg_item_price`, `avg_review_score`, `avg_delivery_days`, `delay_rate_pct`.

