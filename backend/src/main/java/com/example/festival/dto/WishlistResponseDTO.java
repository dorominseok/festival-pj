package com.example.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponseDTO {
    private Long wishlistId;
    private Long userId;
    private Long festivalId;
    private String festivalName;
    private String festivalImageUrl;
    private boolean added;
}
