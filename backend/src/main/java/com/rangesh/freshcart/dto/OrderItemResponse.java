package com.rangesh.freshcart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record OrderItemResponse(
    Integer id,
    @JsonProperty("product_id") Integer productId,
    Integer quantity,
    BigDecimal price,
    String name,
    @JsonProperty("image_url") String imageUrl
) {}
