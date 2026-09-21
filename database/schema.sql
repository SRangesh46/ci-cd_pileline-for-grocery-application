-- ==========================================================
-- Grocery Web Application - Database Schema
-- ==========================================================

CREATE DATABASE IF NOT EXISTS grocery_db;
USE grocery_db;

-- ----------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- Table: products
-- ----------------------------------------------------------
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- Table: orders
-- ----------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLACED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- Table: order_items
-- ----------------------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ----------------------------------------------------------
-- Sample product data
-- ----------------------------------------------------------
INSERT INTO products (name, category, price, stock, image_url, description) VALUES
('Fresh Bananas (1 dozen)', 'Fruits', 45.00, 100, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 'Ripe, fresh yellow bananas.'),
('Red Apples (1 kg)', 'Fruits', 180.00, 80, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 'Crisp and juicy red apples.'),
('Tomatoes (1 kg)', 'Vegetables', 40.00, 120, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', 'Farm fresh red tomatoes.'),
('Onions (1 kg)', 'Vegetables', 35.00, 150, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 'Premium quality onions.'),
('Potatoes (1 kg)', 'Vegetables', 30.00, 150, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 'Fresh farm potatoes.'),
('Whole Milk (1 L)', 'Dairy', 60.00, 60, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 'Pasteurized whole milk.'),
('Cheddar Cheese (200g)', 'Dairy', 150.00, 40, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400', 'Aged cheddar cheese block.'),
('Brown Bread', 'Bakery', 45.00, 50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'Soft whole wheat brown bread.'),
('Basmati Rice (5 kg)', 'Grains', 550.00, 30, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 'Premium long-grain basmati rice.'),
('Toor Dal (1 kg)', 'Grains', 140.00, 45, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', 'High quality toor dal (pigeon peas).'),
('Sunflower Oil (1 L)', 'Cooking Essentials', 165.00, 55, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 'Refined sunflower cooking oil.'),
('Free Range Eggs (12 pcs)', 'Dairy', 90.00, 70, 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400', 'Farm fresh free-range eggs.');
