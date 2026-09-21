package com.rangesh.freshcart.controller;

import com.rangesh.freshcart.entity.Product;
import com.rangesh.freshcart.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search
    ) {
        if (category != null && search != null) {
            return products.findByCategoryAndNameContainingIgnoreCaseOrderByIdAsc(category, search);
        }
        if (category != null) {
            return products.findByCategoryOrderByIdAsc(category);
        }
        if (search != null) {
            return products.findByNameContainingIgnoreCaseOrderByIdAsc(search);
        }
        return products.findAllByOrderByIdAsc();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return products.findDistinctByCategoryIsNotNullOrderByCategoryAsc()
            .stream().map(Product::getCategory).distinct().toList();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Integer id) {
        return products.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found."));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@RequestBody Product product) {
        product.setId(null);
        return products.save(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Integer id, @RequestBody Product input) {
        Product p = products.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found."));
        p.setName(input.getName());
        p.setCategory(input.getCategory());
        p.setPrice(input.getPrice());
        p.setStock(input.getStock());
        p.setImageUrl(input.getImageUrl());
        p.setDescription(input.getDescription());
        return products.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        if (!products.existsById(id)) {
            throw new RuntimeException("Product not found.");
        }
        products.deleteById(id);
    }
}
