package com.example.festival.service;

import com.example.festival.dto.ReviewRequestDTO;
import com.example.festival.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    ReviewResponseDTO createReview(ReviewRequestDTO dto);

    ReviewResponseDTO updateReview(Long id, ReviewRequestDTO dto, Long userId);

    void deleteReview(Long id, Long userId);

    void deleteReview(Long id);

    List<ReviewResponseDTO> getReviewsByFestival(Long festivalId);

    List<ReviewResponseDTO> getReviewsByUser(Long userId);

    List<ReviewResponseDTO> getAllReviews();

    boolean hasUserReservedFestival(Long userId, Long festivalId);
}
