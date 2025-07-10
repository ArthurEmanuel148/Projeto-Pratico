package com.cipalam.cipalam_sistema.controller;

import com.cipalam.cipalam_sistema.DTO.auth.AuthLoginRequestDTO;
import com.cipalam.cipalam_sistema.DTO.auth.AuthLoginResponseDTO;
import com.cipalam.cipalam_sistema.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponseDTO> login(@RequestBody AuthLoginRequestDTO request) {
        AuthLoginResponseDTO response = authService.authenticate(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }
}
