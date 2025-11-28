package com.example.festival.service;

import com.example.festival.dto.ProductSummaryDTO;
import com.example.festival.dto.ReservationRequestDTO;
import com.example.festival.dto.ReservationResponseDTO;
import com.example.festival.entity.Festival;
import com.example.festival.entity.Product;
import com.example.festival.entity.Reservation;
import com.example.festival.entity.User;
import com.example.festival.repository.FestivalRepository;
import com.example.festival.repository.ProductRepository;
import com.example.festival.repository.ReservationRepository;
import com.example.festival.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final FestivalRepository festivalRepository;
    private final ProductRepository productRepository;

    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Festival festival = festivalRepository.findById(dto.getFestivalId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 축제입니다."));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다."));

        Reservation reservation = Reservation.builder()
                .user(user)
                .festival(festival)
                .product(product)
                .discountRate(dto.getDiscountRate())
                .reservationDate(LocalDateTime.now())
                .date(LocalDate.parse(dto.getDate()))
                .time(LocalTime.parse(dto.getTime()))
                .headCount(dto.getHeadCount())
                .status(Reservation.Status.RESERVED)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        return buildResponse(saved);
    }

    @Override
    public List<ReservationResponseDTO> getReservationsByUser(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUser_UserId(userId);
        return reservations.stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long countReservationsByUser(Long userId) {
        return reservationRepository.countByUser_UserIdAndStatusNot(userId, Reservation.Status.CANCELLED);
    }

    @Override
    public ReservationResponseDTO markAttended(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        reservation.setStatus(Reservation.Status.ATTENDED);
        Reservation saved = reservationRepository.save(reservation);

        return buildResponse(saved);
    }

    @Override
    public ReservationResponseDTO cancelReservation(Long userId, Long reservationId) {
        Reservation reservation = reservationRepository.findByReservationIdAndUser_UserId(reservationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("본인 예약을 찾을 수 없습니다."));

        if (reservation.getStatus() == Reservation.Status.CANCELLED) {
            return buildResponse(reservation);
        }

        reservation.setStatus(Reservation.Status.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);
        return buildResponse(saved);
    }

    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReservation(Long reservationId) {
        if (!reservationRepository.existsById(reservationId)) {
            throw new IllegalArgumentException("존재하지 않는 예약입니다.");
        }
        reservationRepository.deleteById(reservationId);
    }

    private ReservationResponseDTO buildResponse(Reservation reservation) {
        Product product = reservation.getProduct();
        Festival festival = reservation.getFestival();

        ProductSummaryDTO productSummary = null;
        if (product != null) {
            productSummary = ProductSummaryDTO.builder()
                    .productId(product.getProductId())
                    .name(product.getName())
                    .imageUrl(product.getImageUrl())
                    .festivalId(product.getFestival().getFestivalId())
                    .build();
        }

        return ReservationResponseDTO.builder()
                .reservationId(reservation.getReservationId())
                .userId(reservation.getUser().getUserId())
                .festivalId(festival != null ? festival.getFestivalId() : null)
                .productId(product != null ? product.getProductId() : null)
                .discountRate(reservation.getDiscountRate())
                .reservationDate(reservation.getReservationDate() != null ? reservation.getReservationDate().toString() : null)
                .festivalName(festival != null ? festival.getName() : null)
                .productName(product != null ? product.getName() : null)
                .date(reservation.getDate().toString())
                .time(reservation.getTime().toString())
                .headCount(reservation.getHeadCount())
                .status(reservation.getStatus().name())
                .product(productSummary)
                .build();
    }
}
