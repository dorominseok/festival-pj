package com.example.festival.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponseDTO {
    private Long productId;
    private Long festivalId;
    private String festivalName;
    private String name;
    private int price;
    private Integer originalPrice;
    private int stock;
    private String productType;
    private String imageUrl;
    private String description;
}
