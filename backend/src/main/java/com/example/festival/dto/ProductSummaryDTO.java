package com.example.festival.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductSummaryDTO {
    private Long productId;
    private String name;
    private String imageUrl;
    private Long festivalId;
}
