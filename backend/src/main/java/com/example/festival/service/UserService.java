package com.example.festival.service;

import com.example.festival.dto.LoginRequestDTO;
import com.example.festival.dto.UserRequestDTO;
import com.example.festival.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO signup(UserRequestDTO userRequestDTO);
    UserResponseDTO login(LoginRequestDTO loginRequestDTO);
    List<UserResponseDTO> findAllUsers();
    UserResponseDTO getUser(Long userId);
    UserResponseDTO updateUser(Long userId, UserRequestDTO dto);
}
