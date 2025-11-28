package com.example.festival.service;

import com.example.festival.dto.LoginRequestDTO;
import com.example.festival.dto.UserRequestDTO;
import com.example.festival.dto.UserResponseDTO;
import com.example.festival.entity.User;
import com.example.festival.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponseDTO signup(UserRequestDTO dto) {
        Optional<User> exists = userRepository.findByEmail(dto.getEmail());
        if (exists.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .interest(joinInterests(dto.getInterests()))
                .joinDate(LocalDateTime.now())
                .build();
        user.setAdmin(0);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UserResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호를 확인해주세요."));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호를 확인해주세요.");
        }

        return toResponse(user);
    }

    @Override
    public List<UserResponseDTO> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return toResponse(user);
    }

    @Override
    public UserResponseDTO updateUser(Long userId, UserRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(dto.getPassword());
        }
        if (dto.getInterests() != null) {
            user.setInterest(joinInterests(dto.getInterests()));
        }

        return toResponse(userRepository.save(user));
    }

    private String joinInterests(List<String> interests) {
        if (interests == null || interests.isEmpty()) {
            return null;
        }
        return String.join(",", interests);
    }

    private List<String> splitInterests(String interest) {
        if (interest == null || interest.isEmpty()) {
            return Collections.emptyList();
        }
        return List.of(interest.split(","));
    }

    private UserResponseDTO toResponse(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .interests(splitInterests(user.getInterest()))
                .joinDate(user.getJoinDate())
                .admin(user.getAdmin())
                .build();
    }
}
