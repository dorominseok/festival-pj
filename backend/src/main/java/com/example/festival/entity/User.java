package com.example.festival.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String interest;

    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private int admin;

    private LocalDateTime joinDate;
}
