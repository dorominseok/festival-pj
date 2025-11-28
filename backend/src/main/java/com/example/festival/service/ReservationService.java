package com.example.festival.service;

import com.example.festival.dto.ReservationRequestDTO;
import com.example.festival.dto.ReservationResponseDTO;

import java.util.List;

public interface ReservationService {
    ReservationResponseDTO createReservation(ReservationRequestDTO dto);

    /**
     * 사용자 예약 목록 조회
     */
    List<ReservationResponseDTO> getReservationsByUser(Long userId);

    /**
     * 사용자 예약 건수 조회
     */
    long countReservationsByUser(Long userId);

    /**
     * 예약 참석 처리
     */
    ReservationResponseDTO markAttended(Long reservationId);

    /**
     * 사용자 예약 취소
     */
    ReservationResponseDTO cancelReservation(Long userId, Long reservationId);

    /**
     * 관리자: 모든 예약 조회
     */
    List<ReservationResponseDTO> getAllReservations();

    /**
     * 관리자: 예약 삭제
     */
    void deleteReservation(Long reservationId);
}
