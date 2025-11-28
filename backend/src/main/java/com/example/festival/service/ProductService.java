package com.example.festival.service;

import com.example.festival.dto.ProductResponseDTO;
import com.example.festival.entity.Product;
import java.util.List;

public interface ProductService {

    Product createProduct(Product product);

    List<ProductResponseDTO> getAllProducts();

    ProductResponseDTO getProduct(Long id);

    List<ProductResponseDTO> getProductsByFestival(Long festivalId);

    Product updateProduct(Long id, Product updatedProduct);

    void deleteProduct(Long id);
}
