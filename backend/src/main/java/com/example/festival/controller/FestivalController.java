package com.example.festival.controller;

import com.example.festival.dto.FestivalRequestDTO;
import com.example.festival.dto.FestivalResponseDTO;
import com.example.festival.dto.ProductResponseDTO;
import com.example.festival.service.FestivalService;
import com.example.festival.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/festivals")
public class FestivalController {

    private final FestivalService festivalService;
    private final ProductService productService;

    @GetMapping
    public List<FestivalResponseDTO> getAll() {
        return festivalService.getAllFestivals();
    }

    @GetMapping("/{id}")
    public FestivalResponseDTO getOne(@PathVariable("id") Long id) {
        return festivalService.getFestival(id);
    }

    @GetMapping("/recommended")
    public List<FestivalResponseDTO> getRecommended(@RequestParam("userId") Long userId) {
        return festivalService.getRecommendedFestivals(userId);
    }

    @GetMapping("/upcoming")
    public List<FestivalResponseDTO> getUpcoming() {
        return festivalService.getUpcomingFestivals();
    }

    @PostMapping
    public FestivalResponseDTO createFestival(@RequestBody FestivalRequestDTO request) {
        return festivalService.createFestival(request);
    }

    @PutMapping("/{id}")
    public FestivalResponseDTO updateFestival(@PathVariable Long id, @RequestBody FestivalRequestDTO request) {
        return festivalService.updateFestival(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteFestival(@PathVariable Long id) {
        festivalService.deleteFestival(id);
    }

    @GetMapping("/{id}/products")
    public List<ProductResponseDTO> getProductsByFestival(@PathVariable("id") Long id) {
        return productService.getProductsByFestival(id);
    }
}
