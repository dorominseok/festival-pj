package com.example.festival.service;

import com.example.festival.dto.ReviewRequestDTO;
import com.example.festival.dto.ReviewResponseDTO;
import com.example.festival.entity.Reservation;
import com.example.festival.entity.Review;
import com.example.festival.repository.ReservationRepository;
import com.example.festival.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO dto) {

        if (!hasUserReservedFestival(dto.getUserId(), dto.getFestivalId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "해당 축제의 상품을 예약한 사용자만 리뷰를 작성할 수 있습니다."
            );
        }

        boolean existReview =
                reviewRepository.findByUser_UserIdAndFestival_FestivalId(dto.getUserId(), dto.getFestivalId()).isPresent();

        if (existReview) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 작성된 리뷰가 존재합니다."
            );
        }

        Reservation reservation = reservationRepository
                .findByUser_UserIdAndProduct_Festival_FestivalId(dto.getUserId(), dto.getFestivalId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "예약 정보를 찾을 수 없습니다."));

        Review review = Review.builder()
                .rating(dto.getRating())
                .content(dto.getContent())
                .reviewDate(LocalDateTime.now())
                .lastModified(LocalDateTime.now())
                .user(reservation.getUser())
                .festival(reservation.getFestival())
                .build();

        Review saved = reviewRepository.save(review);
        return convertToDTO(saved);
    }

    @Override
    public ReviewResponseDTO updateReview(Long id, ReviewRequestDTO dto, Long userId) {

        Review origin = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));

        if (!origin.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 리뷰만 수정 가능합니다.");
        }

        origin.setRating(dto.getRating());
        origin.setContent(dto.getContent());
        origin.setLastModified(LocalDateTime.now());

        Review saved = reviewRepository.save(origin);
        return convertToDTO(saved);
    }

    @Override
    public void deleteReview(Long id, Long userId) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 리뷰만 삭제 가능합니다.");
        }

        reviewRepository.deleteById(id);
    }

    @Override
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다.");
        }
        reviewRepository.deleteById(id);
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByFestival(Long festivalId) {
        return reviewRepository.findByFestival_FestivalId(festivalId)
                .stream().map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getReviewsByUser(Long userId) {
        return reviewRepository.findByUser_UserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasUserReservedFestival(Long userId, Long festivalId) {
        List<Reservation> reservations =
                reservationRepository.findByUser_UserIdAndProduct_Festival_FestivalId(userId, festivalId);
        return !reservations.isEmpty();
    }

    private ReviewResponseDTO convertToDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getReviewId())
                .rating(review.getRating())
                .content(review.getContent())
                .reviewDate(review.getReviewDate())
                .lastModified(review.getLastModified())
                .userId(review.getUser().getUserId())
                .userName(review.getUser().getName())
                .festivalId(review.getFestival().getFestivalId())
                .festivalName(review.getFestival().getName())
                .build();
    }
}
