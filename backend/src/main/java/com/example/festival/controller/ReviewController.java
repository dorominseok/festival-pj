package com.example.festival.controller;

import com.example.festival.dto.ReviewRequestDTO;
import com.example.festival.dto.ReviewResponseDTO;
import com.example.festival.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponseDTO create(@RequestBody ReviewRequestDTO dto) {
        return reviewService.createReview(dto);
    }

    @PutMapping("/{id}/{userId}")
    public ReviewResponseDTO update(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody ReviewRequestDTO dto) {

        return reviewService.updateReview(id, dto, userId);
    }

    @DeleteMapping("/{id}/{userId}")
    public void delete(@PathVariable Long id, @PathVariable Long userId) {
        reviewService.deleteReview(id, userId);
    }

    @DeleteMapping("/{id}")
    public void deleteByAdmin(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    @GetMapping("/festival/{festivalId}")
    public List<ReviewResponseDTO> getByFestival(@PathVariable Long festivalId) {
        return reviewService.getReviewsByFestival(festivalId);
    }

    @GetMapping("/user/{userId}")
    public List<ReviewResponseDTO> getByUser(@PathVariable Long userId) {
        return reviewService.getReviewsByUser(userId);
    }

    @GetMapping("/all")
    public List<ReviewResponseDTO> getAll() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/eligible")
    public boolean isEligible(
            @RequestParam("userId") Long userId,
            @RequestParam("festivalId") Long festivalId) {
        return reviewService.hasUserReservedFestival(userId, festivalId);
    }
}
