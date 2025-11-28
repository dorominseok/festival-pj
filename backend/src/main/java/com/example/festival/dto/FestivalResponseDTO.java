package com.example.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FestivalResponseDTO {

    private Long id;                // festivalId
    private String title;           // name
    private String description;
    private String location;

    private List<String> categories;  // "공연,전시,체험" -> ["공연","전시","체험"]
    private String category;          // 첫 번째 카테고리 (추천 정렬용)
    private Double averageRating;

    private Double lat;
    private Double lng;

    private String imageUrl;

    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
}
