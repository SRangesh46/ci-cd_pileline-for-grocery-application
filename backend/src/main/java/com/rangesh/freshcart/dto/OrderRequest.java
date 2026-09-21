package com.rangesh.freshcart.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record OrderRequest(
    @NotEmpty List<@Valid Item> items
) {
    public record Item(
        @Min(1) Integer product_id,
        @Min(1) Integer quantity
    ) {}
}
