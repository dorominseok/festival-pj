package com.example.festival.service;

import com.example.festival.dto.FestivalRequestDTO;
import com.example.festival.dto.FestivalResponseDTO;
import com.example.festival.entity.Festival;
import com.example.festival.entity.User;
import com.example.festival.repository.FestivalRepository;
import com.example.festival.repository.ProductRepository;
import com.example.festival.repository.ReservationRepository;
import com.example.festival.repository.ReviewRepository;
import com.example.festival.repository.UserRepository;
import com.example.festival.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FestivalServiceImpl implements FestivalService {

    private final FestivalRepository festivalRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ReservationRepository reservationRepository;
    private final WishlistRepository wishlistRepository;

    @Override
    public List<FestivalResponseDTO> getAllFestivals() {
        return reviewRepository.findAllFestivalsOrderByRating()
                .stream()
                .map(stat -> convertToDTO(stat.getFestival(), stat.getAvgRating()))
                .toList();
    }

    @Override
    public FestivalResponseDTO getFestival(Long festivalId) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 축제입니다."));

        return convertToDTO(festival);
    }

    @Override
    public List<FestivalResponseDTO> getRecommendedFestivals(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String interest = user.getInterest();
        List<Festival> all = festivalRepository.findAll();

        List<Festival> preferred = all.stream()
                .filter(f -> matchesInterest(f, interest))
                .toList();

        List<Festival> others = all.stream()
                .filter(f -> !matchesInterest(f, interest))
                .toList();

        return concat(preferred, others).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FestivalResponseDTO createFestival(FestivalRequestDTO request) {
        String categories = request.getCategories();
        if (categories == null || categories.isBlank()) {
            categories = request.getCategory();
        }

        Festival festival = Festival.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .categories(categories)
                .lat(request.getLat())
                .lng(request.getLng())
                .imageUrl(request.getImageUrl())
                .region(request.getRegion())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Festival saved = festivalRepository.save(festival);
        return convertToDTO(saved);
    }

    @Override
    public List<FestivalResponseDTO> getUpcomingFestivals() {
        LocalDate today = LocalDate.now();
        return festivalRepository.findByEndDateGreaterThanEqualOrderByStartDateAsc(today)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public FestivalResponseDTO updateFestival(Long festivalId, FestivalRequestDTO request) {
        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 축제입니다."));

        String categories = request.getCategories();
        if (categories == null || categories.isBlank()) {
            categories = request.getCategory();
        }

        if (request.getName() != null) festival.setName(request.getName());
        if (request.getDescription() != null) festival.setDescription(request.getDescription());
        if (request.getLocation() != null) festival.setLocation(request.getLocation());
        if (categories != null) festival.setCategories(categories);
        if (request.getLat() != null) festival.setLat(request.getLat());
        if (request.getLng() != null) festival.setLng(request.getLng());
        if (request.getImageUrl() != null) festival.setImageUrl(request.getImageUrl());
        if (request.getRegion() != null) festival.setRegion(request.getRegion());
        if (request.getStartDate() != null) festival.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) festival.setEndDate(request.getEndDate());

        Festival saved = festivalRepository.save(festival);
        return convertToDTO(saved);
    }

    @Override
    public void deleteFestival(Long festivalId) {
        if (!festivalRepository.existsById(festivalId)) {
            throw new IllegalArgumentException("존재하지 않는 축제입니다.");
        }
        // Delete dependencies first to avoid FK constraint errors
        reservationRepository.deleteByFestival_FestivalId(festivalId);
        reviewRepository.deleteByFestival_FestivalId(festivalId);
        wishlistRepository.deleteByFestival_FestivalId(festivalId);
        productRepository.deleteByFestival_FestivalId(festivalId);
        festivalRepository.deleteById(festivalId);
    }

    private boolean matchesInterest(Festival festival, String interest) {
        if (interest == null || interest.isBlank()) return false;
        List<String> cats = splitCategories(festival.getCategories());
        return cats.stream().anyMatch(c -> c.equalsIgnoreCase(interest.trim()));
    }

    private List<Festival> concat(List<Festival> a, List<Festival> b) {
        java.util.ArrayList<Festival> merged = new java.util.ArrayList<>(a);
        merged.addAll(b);
        return merged;
    }

    private FestivalResponseDTO convertToDTO(Festival f) {
        return convertToDTO(f, null);
    }

    private FestivalResponseDTO convertToDTO(Festival f, Double avgRatingOverride) {
        List<String> categories = splitCategories(f.getCategories());
        String primaryCategory = categories.isEmpty() ? null : categories.get(0);
        Double averageRating = avgRatingOverride != null
                ? avgRatingOverride
                : reviewRepository.findAverageRatingByFestival(f.getFestivalId());

        return FestivalResponseDTO.builder()
                .id(f.getFestivalId())
                .title(f.getName())
                .description(f.getDescription())
                .location(f.getLocation())
                .categories(categories)
                .category(primaryCategory)
                .averageRating(averageRating)
                .lat(f.getLat())
                .lng(f.getLng())
                .imageUrl(f.getImageUrl())
                .region(f.getRegion())
                .startDate(f.getStartDate())
                .endDate(f.getEndDate())
                .build();
    }

    private List<String> splitCategories(String categories) {
        if (categories == null || categories.trim().isEmpty() || categories.equals("[]")) {
            return List.of();
        }
        String cleaned = categories.replace("[", "").replace("]", "");
        return Arrays.stream(cleaned.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
