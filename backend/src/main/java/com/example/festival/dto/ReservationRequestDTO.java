package com.example.festival.dto;

import lombok.Data;

@Data
public class ReservationRequestDTO {

    private Long userId;
    private Long festivalId;
    private Long productId;
    private Double discountRate;

    private String date;   // "2025-10-01"
    private String time;   // "18:00"

    private int headCount; // 인원수
}
