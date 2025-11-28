package com.example.festival.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserResponseDTO {
    private Long userId;
    private String name;
    private String email;
    private List<String> interests;
    private LocalDateTime joinDate;
    private Integer admin;
}
