package com.example.festival.repository;

import com.example.festival.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser_UserIdAndFestival_FestivalId(Long userId, Long festivalId);

    List<Reservation> findByUser_UserId(Long userId);

    long countByUser_UserId(Long userId);

    long countByUser_UserIdAndStatusNot(Long userId, Reservation.Status status);

    List<Reservation> findByUser_UserIdAndProduct_Festival_FestivalId(Long userId, Long festivalId);

    Optional<Reservation> findByReservationIdAndUser_UserId(Long reservationId, Long userId);

    void deleteByFestival_FestivalId(Long festivalId);
}
