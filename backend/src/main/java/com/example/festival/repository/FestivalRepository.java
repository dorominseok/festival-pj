package com.example.festival.repository;

import com.example.festival.entity.Festival;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FestivalRepository extends JpaRepository<Festival, Long> {
    List<Festival> findByEndDateGreaterThanEqualOrderByStartDateAsc(LocalDate date);
}
