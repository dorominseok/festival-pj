package com.example.festival.controller;

import com.example.festival.dto.LoginRequestDTO;
import com.example.festival.dto.UserRequestDTO;
import com.example.festival.dto.UserResponseDTO;
import com.example.festival.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public UserResponseDTO signup(@RequestBody UserRequestDTO dto) {
        return userService.signup(dto);
    }

    @PostMapping("/login")
    public UserResponseDTO login(@RequestBody LoginRequestDTO dto) {
        return userService.login(dto);
    }

    @GetMapping
    public List<UserResponseDTO> findAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}")
    public UserResponseDTO updateUser(@PathVariable Long id, @RequestBody UserRequestDTO dto) {
        return userService.updateUser(id, dto);
    }
}
