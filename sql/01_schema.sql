-- ====================================================================
-- Olist Brazilian E-Commerce Database Schema
-- Database: olist_db
-- ====================================================================

-- Drop existing tables with CASCADE to ensure clean recreation
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS geolocation CASCADE;

-- --------------------------------------------------------------------
-- 1. Geolocation Dimension
-- --------------------------------------------------------------------
CREATE TABLE geolocation (
    geolocation_zip_code_prefix INT PRIMARY KEY,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    city VARCHAR(100),
    state VARCHAR(5)
);

-- --------------------------------------------------------------------
-- 2. Customers Dimension
-- --------------------------------------------------------------------
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50) NOT NULL,
    customer_zip_code_prefix INT,
    customer_city VARCHAR(100),
    customer_state VARCHAR(5)
);

CREATE INDEX idx_customers_unique_id ON customers(customer_unique_id);
CREATE INDEX idx_customers_state ON customers(customer_state);

-- --------------------------------------------------------------------
-- 3. Products Dimension
-- --------------------------------------------------------------------
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100),
    product_name_lenght NUMERIC(10, 2),
    product_description_lenght NUMERIC(10, 2),
    product_photos_qty NUMERIC(10, 2),
    product_weight_g NUMERIC(10, 2),
    product_length_cm NUMERIC(10, 2),
    product_height_cm NUMERIC(10, 2),
    product_width_cm NUMERIC(10, 2),
    product_category_name_english VARCHAR(100)
);

CREATE INDEX idx_products_category ON products(product_category_name_english);

-- --------------------------------------------------------------------
-- 4. Sellers Dimension
-- --------------------------------------------------------------------
CREATE TABLE sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix INT,
    seller_city VARCHAR(100),
    seller_state VARCHAR(5)
);

CREATE INDEX idx_sellers_state ON sellers(seller_state);

-- --------------------------------------------------------------------
-- 5. Orders Fact
-- --------------------------------------------------------------------
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    order_status VARCHAR(20) NOT NULL,
    order_purchase_timestamp TIMESTAMP NOT NULL,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP NOT NULL,
    purchase_year INT,
    purchase_month INT,
    purchase_year_month VARCHAR(10),
    purchase_day_name VARCHAR(15),
    purchase_hour INT,
    delivery_duration_days NUMERIC(8, 2),
    estimated_duration_days NUMERIC(8, 2),
    delivery_delay_days NUMERIC(8, 2),
    is_delayed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_purchase_timestamp ON orders(order_purchase_timestamp);
CREATE INDEX idx_orders_purchase_ym ON orders(purchase_year_month);

-- --------------------------------------------------------------------
-- 6. Order Items Fact
-- --------------------------------------------------------------------
CREATE TABLE order_items (
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    order_item_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL REFERENCES products(product_id),
    seller_id VARCHAR(50) NOT NULL REFERENCES sellers(seller_id),
    shipping_limit_date TIMESTAMP,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    freight_value NUMERIC(10, 2) NOT NULL CHECK (freight_value >= 0),
    total_item_value NUMERIC(10, 2) NOT NULL CHECK (total_item_value >= 0),
    PRIMARY KEY (order_id, order_item_id)
);

CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);

-- --------------------------------------------------------------------
-- 7. Order Payments Fact
-- --------------------------------------------------------------------
CREATE TABLE payments (
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_sequential INT NOT NULL,
    payment_type VARCHAR(30) NOT NULL,
    payment_installments INT NOT NULL DEFAULT 1 CHECK (payment_installments >= 0),
    payment_value NUMERIC(10, 2) NOT NULL CHECK (payment_value >= 0),
    PRIMARY KEY (order_id, payment_sequential)
);

CREATE INDEX idx_payments_type ON payments(payment_type);

-- --------------------------------------------------------------------
-- 8. Order Reviews Fact
-- --------------------------------------------------------------------
CREATE TABLE reviews (
    review_id VARCHAR(50),
    order_id VARCHAR(50) PRIMARY KEY REFERENCES orders(order_id) ON DELETE CASCADE,
    review_score INT NOT NULL CHECK (review_score BETWEEN 1 AND 5),
    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP,
    review_comment_title TEXT,
    review_comment_message TEXT
);

CREATE INDEX idx_reviews_score ON reviews(review_score);
