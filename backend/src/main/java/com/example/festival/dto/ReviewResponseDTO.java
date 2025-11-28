package com.example.festival.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponseDTO {
    private Long reviewId;
    private Double rating;
    private String content;
    private LocalDateTime reviewDate;
    private LocalDateTime lastModified;
    private Long userId;
    private String userName;
    private Long festivalId;
    private String festivalName;
}
