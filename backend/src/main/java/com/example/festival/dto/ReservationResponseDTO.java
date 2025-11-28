package com.example.festival.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationResponseDTO {

    private Long reservationId;

    private Long userId;
    private Long festivalId;
    private Long productId;
    private Double discountRate;
    private String reservationDate;

    private String festivalName;
    private String productName;

    private String date;
    private String time;

    private int headCount;

    private String status;

    private ProductSummaryDTO product;
}
