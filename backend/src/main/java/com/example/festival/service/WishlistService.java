package com.example.festival.service;

import com.example.festival.dto.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {

    WishlistResponseDTO toggleWishlist(Long userId, Long festivalId);

    void removeWishlist(Long userId, Long festivalId);

    List<WishlistResponseDTO> getWishlistByUser(Long userId);
}
