package com.rangesh.freshcart.repository;

import com.rangesh.freshcart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findAllByOrderByIdAsc();
    List<Product> findByCategoryOrderByIdAsc(String category);
    List<Product> findByNameContainingIgnoreCaseOrderByIdAsc(String name);
    List<Product> findByCategoryAndNameContainingIgnoreCaseOrderByIdAsc(String category, String name);
    List<Product> findDistinctByCategoryIsNotNullOrderByCategoryAsc();
}
