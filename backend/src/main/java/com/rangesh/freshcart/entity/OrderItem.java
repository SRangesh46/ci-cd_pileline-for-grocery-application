package com.rangesh.freshcart.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public Integer getId() { return id; }
    public Integer getOrderId() { return orderId; }
    public Integer getProductId() { return productId; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }

    public void setId(Integer id) { this.id = id; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public void setProductId(Integer productId) { this.productId = productId; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
