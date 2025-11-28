package com.example.festival.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "festival_id", nullable = false)
    private Festival festival;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int price;

    @Column(nullable = true)
    private Integer originalPrice;

    @Column(nullable = false)
    private int stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType productType;

    @Column(nullable = true)
    private String imageUrl;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String description;

    public enum ProductType {
        food,
        goods,
        activity
    }
}
