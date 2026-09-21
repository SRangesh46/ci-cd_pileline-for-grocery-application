package com.rangesh.freshcart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Integer id,
    @JsonProperty("total_amount") BigDecimal totalAmount,
    String status,
    @JsonProperty("created_at") LocalDateTime createdAt,
    List<OrderItemResponse> items
) {}
