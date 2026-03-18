-- ============================================================
--  Food Delivery Application — Database Schema
--  Engine: PostgreSQL 14+
-- ============================================================

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('UPI', 'CREDIT_CARD', 'CASH_ON_DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- Table: users  (JWT auth credentials)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id  BIGSERIAL    PRIMARY KEY,
    username VARCHAR(60)  NOT NULL UNIQUE,
    email    VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Table: customers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    customer_id   BIGSERIAL    PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    contact       CHAR(10)     NOT NULL UNIQUE,
    address       VARCHAR(255),
    CONSTRAINT chk_contact_digits CHECK (contact ~ '^[0-9]{10}$')
);

-- ------------------------------------------------------------
-- Table: restaurants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id   BIGSERIAL    PRIMARY KEY,
    restaurant_name VARCHAR(150) NOT NULL,
    location        VARCHAR(255) NOT NULL
);

-- ------------------------------------------------------------
-- Table: menu_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    item_id       BIGSERIAL      PRIMARY KEY,
    item_name     VARCHAR(150)   NOT NULL,
    price         NUMERIC(10,2)  NOT NULL,
    availability  BOOLEAN        NOT NULL DEFAULT TRUE,
    restaurant_id BIGINT         NOT NULL,
    CONSTRAINT chk_menu_item_price    CHECK (price >= 0),
    CONSTRAINT fk_menu_item_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (restaurant_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table: payments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    payment_id     BIGSERIAL           PRIMARY KEY,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'PENDING',
    amount         NUMERIC(10,2)       NOT NULL
);

-- ------------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    order_id        BIGSERIAL         PRIMARY KEY,
    order_date_time TIMESTAMP         NOT NULL DEFAULT NOW(),
    status          order_status_enum NOT NULL DEFAULT 'PENDING',
    total_amount    NUMERIC(10,2)     NOT NULL DEFAULT 0.00,
    customer_id     BIGINT            NOT NULL,
    restaurant_id   BIGINT            NOT NULL,
    payment_id      BIGINT            NOT NULL UNIQUE,
    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)   REFERENCES customers   (customer_id),
    CONSTRAINT fk_order_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (restaurant_id),
    CONSTRAINT fk_order_payment
        FOREIGN KEY (payment_id)    REFERENCES payments    (payment_id)
);

-- ------------------------------------------------------------
-- Table: order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGSERIAL     PRIMARY KEY,
    quantity      INT           NOT NULL,
    subtotal      NUMERIC(10,2) NOT NULL,
    order_id      BIGINT        NOT NULL,
    item_id       BIGINT        NOT NULL,
    CONSTRAINT chk_order_item_qty CHECK (quantity >= 1),
    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id) REFERENCES orders     (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_item_menu
        FOREIGN KEY (item_id)  REFERENCES menu_items (item_id)
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant  ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_datetime    ON orders (order_date_time);
CREATE INDEX IF NOT EXISTS idx_menu_restaurant    ON menu_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_availability  ON menu_items (availability);
