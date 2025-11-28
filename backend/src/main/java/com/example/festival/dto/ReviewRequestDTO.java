package com.example.festival.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class ReviewRequestDTO {
    private Long userId;
    private Long festivalId;  // 리뷰 대상 축제
    private Long productId;   // 옵션 사용 안함
    private Double rating;
    private String content;
}
