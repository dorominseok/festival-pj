package com.example.festival.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FestivalRequestDTO {
    private String category;
    private String description;

    @JsonProperty("end_date")
    private LocalDate endDate;

    private String location;
    private String name;
    private String region;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("image_url")
    private String imageUrl;

    private Double lat;
    private Double lng;

    /**
     * Comma-separated categories string. If both category and categories are provided,
     * categories takes precedence.
     */
    private String categories;
}
