package com.example.festival.service;

import com.example.festival.dto.WishlistResponseDTO;
import com.example.festival.entity.Festival;
import com.example.festival.entity.Wishlist;
import com.example.festival.entity.User;
import com.example.festival.repository.FestivalRepository;
import com.example.festival.repository.UserRepository;
import com.example.festival.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final FestivalRepository festivalRepository;

    @Override
    public WishlistResponseDTO toggleWishlist(Long userId, Long festivalId) {

        Festival festival = festivalRepository.findById(festivalId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 축제입니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return wishlistRepository.findByUser_UserIdAndFestival_FestivalId(userId, festivalId)
                .map(existing -> {
                    wishlistRepository.delete(existing);
                    return WishlistResponseDTO.builder()
                            .wishlistId(existing.getWishlistId())
                            .userId(userId)
                            .festivalId(festivalId)
                            .festivalName(festival.getName())
                            .festivalImageUrl(festival.getImageUrl())
                            .added(false)
                            .build();
                })
                .orElseGet(() -> {
                    Wishlist wishlist = Wishlist.builder()
                            .user(user)
                            .festival(festival)
                            .build();

                    Wishlist saved = wishlistRepository.save(wishlist);
                    return toDTO(saved, true);
                });
    }

    @Override
    public void removeWishlist(Long userId, Long festivalId) {
        wishlistRepository.deleteByUser_UserIdAndFestival_FestivalId(userId, festivalId);
    }

    @Override
    public List<WishlistResponseDTO> getWishlistByUser(Long userId) {
        return wishlistRepository.findByUser_UserId(userId)
                .stream()
                .map(w -> toDTO(w, true))
                .collect(Collectors.toList());
    }

    private WishlistResponseDTO toDTO(Wishlist wishlist, boolean added) {
        Festival festival = wishlist.getFestival();

        return WishlistResponseDTO.builder()
                .wishlistId(wishlist.getWishlistId())
                .userId(wishlist.getUser().getUserId())
                .festivalId(festival != null ? festival.getFestivalId() : null)
                .festivalName(festival != null ? festival.getName() : null)
                .festivalImageUrl(festival != null ? festival.getImageUrl() : null)
                .added(added)
                .build();
    }
}
