package com.example.festival.controller;

import com.example.festival.dto.ReservationRequestDTO;
import com.example.festival.dto.ReservationResponseDTO;
import com.example.festival.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * 예약 생성
     */
    @PostMapping
    public ReservationResponseDTO create(@RequestBody ReservationRequestDTO dto) {
        return reservationService.createReservation(dto);
    }

    @GetMapping("/user/{userId}")
    public List<ReservationResponseDTO> getByUser(@PathVariable Long userId) {
        return reservationService.getReservationsByUser(userId);
    }

    @GetMapping("/count/{userId}")
    public long countByUser(@PathVariable Long userId) {
        return reservationService.countReservationsByUser(userId);
    }

    @PutMapping("/{id}/attended")
    public ReservationResponseDTO markAttended(@PathVariable("id") Long id) {
        return reservationService.markAttended(id);
    }

    @PutMapping("/{id}/cancel")
    public Map<String, Object> cancel(@PathVariable("id") Long id, @RequestParam("userId") Long userId) {
        ReservationResponseDTO dto = reservationService.cancelReservation(userId, id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "예약이 취소되었습니다.");
        response.put("reservation", dto);
        return response;
    }

    // 관리자: 모든 예약 조회
    @GetMapping("/all")
    public List<ReservationResponseDTO> getAll() {
        return reservationService.getAllReservations();
    }

    // 관리자: 예약 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
    }
}
