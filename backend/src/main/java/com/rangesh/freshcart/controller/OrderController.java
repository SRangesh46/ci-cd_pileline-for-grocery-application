package com.rangesh.freshcart.controller;

import com.rangesh.freshcart.dto.*;
import com.rangesh.freshcart.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(
        @RequestAttribute(value = "userId", required = false) Integer userId,
        @Valid @RequestBody OrderRequest request
    ) {
        requireLogin(userId);
        return service.placeOrder(userId, request);
    }

    @GetMapping
    public List<OrderResponse> getOrders(
        @RequestAttribute(value = "userId", required = false) Integer userId
    ) {
        requireLogin(userId);
        return service.getOrders(userId);
    }

    private void requireLogin(Integer userId) {
        if (userId == null) {
            throw new RuntimeException("Authentication required.");
        }
    }
}
