package com.example.festival.service;

import com.example.festival.dto.ProductResponseDTO;
import com.example.festival.entity.Festival;
import com.example.festival.entity.Product;
import com.example.festival.repository.FestivalRepository;
import com.example.festival.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final FestivalRepository festivalRepository;

    @Override
    public Product createProduct(Product product) {
        Festival festival = resolveFestival(product.getFestival());
        product.setFestival(festival);
        return productRepository.save(product);
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return convertToDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getProductsByFestival(Long festivalId) {
        return productRepository.findByFestival_FestivalId(festivalId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Product updateProduct(Long id, Product updatedProduct) {
        Product exist = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        Festival festival = resolveFestival(updatedProduct.getFestival());

        exist.setFestival(festival);
        exist.setName(updatedProduct.getName());
        exist.setPrice(updatedProduct.getPrice());
        exist.setOriginalPrice(updatedProduct.getOriginalPrice());
        exist.setStock(updatedProduct.getStock());
        exist.setProductType(updatedProduct.getProductType());
        exist.setImageUrl(updatedProduct.getImageUrl());
        exist.setDescription(updatedProduct.getDescription());

        return productRepository.save(exist);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductResponseDTO convertToDTO(Product product) {

        Festival festival = product.getFestival();
        Long festivalId = festival != null ? festival.getFestivalId() : null;
        String festivalName = festival != null ? festival.getName() : null;

        return ProductResponseDTO.builder()
                .productId(product.getProductId())
                .festivalId(festivalId)
                .festivalName(festivalName)
                .name(product.getName())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .stock(product.getStock())
                .productType(product.getProductType().name())
                .imageUrl(product.getImageUrl())
                .description(product.getDescription())
                .build();
    }

    private Festival resolveFestival(Festival festival) {
        if (festival == null || festival.getFestivalId() == null) {
            throw new IllegalArgumentException("상품은 축제 정보를 포함해야 합니다.");
        }
        return festivalRepository.findById(festival.getFestivalId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 축제입니다."));
    }
}
