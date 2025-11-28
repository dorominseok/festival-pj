package com.example.festival.controller;

import com.example.festival.dto.WishlistResponseDTO;
import com.example.festival.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{userId}/{festivalId}")
    public WishlistResponseDTO toggle(@PathVariable Long userId, @PathVariable Long festivalId) {
        return wishlistService.toggleWishlist(userId, festivalId);
    }

    @DeleteMapping("/{userId}/{festivalId}")
    public void delete(@PathVariable Long userId, @PathVariable Long festivalId) {
        wishlistService.removeWishlist(userId, festivalId);
    }

    @GetMapping("/{userId}")
    public List<WishlistResponseDTO> getByUser(@PathVariable Long userId) {
        return wishlistService.getWishlistByUser(userId);
    }
}
