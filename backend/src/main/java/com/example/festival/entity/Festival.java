package com.example.festival.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "festival")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Festival {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long festivalId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    // 삭제: private String category;

    @Column(nullable = true)
    private String categories; // 예: "공연,전시,예술"

    @Column(nullable = true)
    private Double lat; // 위도

    @Column(nullable = true)
    private Double lng; // 경도

    @Column(nullable = true)
    private String imageUrl; // 이미지 URL

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;
}
