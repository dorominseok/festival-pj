package com.example.festival.repository;

import com.example.festival.entity.Festival;
import com.example.festival.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUser_UserIdAndFestival_FestivalId(Long userId, Long festivalId);

    List<Review> findByFestival_FestivalId(Long festivalId);

    List<Review> findByUser_UserId(Long userId);

    @Query("select avg(r.rating) from Review r where r.festival.festivalId = :festivalId")
    Double findAverageRatingByFestival(@Param("festivalId") Long festivalId);

    void deleteByFestival_FestivalId(Long festivalId);

    @Query("""
        select f as festival,
               coalesce(avg(r.rating), 0) as avgRating,
               count(r.reviewId) as reviewCount
        from Festival f
        left join Review r on r.festival = f
        group by f.festivalId, f.name, f.description, f.location, f.categories,
                 f.lat, f.lng, f.imageUrl, f.region, f.startDate, f.endDate
        order by avgRating desc
    """)
    List<FestivalRatingProjection> findAllFestivalsOrderByRating();

    interface FestivalRatingProjection {
        Festival getFestival();
        Double getAvgRating();
        Long getReviewCount();
    }
}
