package com.rangesh.freshcart.service;

import com.rangesh.freshcart.dto.*;
import com.rangesh.freshcart.entity.*;
import com.rangesh.freshcart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final OrderItemRepository orderItems;
    private final ProductRepository products;

    public OrderService(OrderRepository orders, OrderItemRepository orderItems, ProductRepository products) {
        this.orders = orders;
        this.orderItems = orderItems;
        this.products = products;
    }

    @Transactional
    public OrderResponse placeOrder(Integer userId, OrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new RuntimeException("Cart is empty.");
        }

        BigDecimal total = BigDecimal.ZERO;
        List<Product> validatedProducts = new ArrayList<>();

        for (OrderRequest.Item item : request.items()) {
            Product product = products.findById(item.product_id())
                .orElseThrow(() -> new RuntimeException("Product ID " + item.product_id() + " not found."));

            if (product.getStock() < item.quantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName() + ".");
            }

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
            validatedProducts.add(product);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(total);
        order.setStatus("PLACED");
        order = orders.save(order);

        for (int i = 0; i < request.items().size(); i++) {
            OrderRequest.Item requested = request.items().get(i);
            Product product = validatedProducts.get(i);

            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setProductId(product.getId());
            oi.setQuantity(requested.quantity());
            oi.setPrice(product.getPrice());
            orderItems.save(oi);

            product.setStock(product.getStock() - requested.quantity());
            products.save(product);
        }

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Integer userId) {
        return orders.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).toList();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = orderItems.findByOrderId(order.getId())
            .stream().map(oi -> {
                Product p = products.findById(oi.getProductId()).orElse(null);
                return new OrderItemResponse(
                    oi.getId(),
                    oi.getProductId(),
                    oi.getQuantity(),
                    oi.getPrice(),
                    p == null ? null : p.getName(),
                    p == null ? null : p.getImageUrl()
                );
            }).toList();

        return new OrderResponse(
            order.getId(),
            order.getTotalAmount(),
            order.getStatus(),
            order.getCreatedAt(),
            items
        );
    }
}
