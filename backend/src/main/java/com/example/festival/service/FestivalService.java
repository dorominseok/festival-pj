package com.example.festival.service;

import com.example.festival.dto.FestivalResponseDTO;
import com.example.festival.dto.FestivalRequestDTO;
import java.util.List;

public interface FestivalService {

    List<FestivalResponseDTO> getAllFestivals();

    FestivalResponseDTO getFestival(Long festivalId);

    List<FestivalResponseDTO> getRecommendedFestivals(Long userId);

    FestivalResponseDTO createFestival(FestivalRequestDTO request);

    List<FestivalResponseDTO> getUpcomingFestivals();

    FestivalResponseDTO updateFestival(Long festivalId, FestivalRequestDTO request);

    void deleteFestival(Long festivalId);
}
