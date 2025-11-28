package com.example.festival.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserRequestDTO {
    private String name;
    private String email;
    private String password;
    private List<String> interests;
}
