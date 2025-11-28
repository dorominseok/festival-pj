package com.example.festival.repository;

import com.example.festival.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUser_UserIdAndFestival_FestivalId(Long userId, Long festivalId);

    List<Wishlist> findByUser_UserId(Long userId);

    void deleteByUser_UserIdAndFestival_FestivalId(Long userId, Long festivalId);

    void deleteByFestival_FestivalId(Long festivalId);
}
