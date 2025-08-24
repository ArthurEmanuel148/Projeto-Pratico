package com.cipalam.cipalam_sistema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/encrypt")
    public String encryptPassword(@RequestParam String senha) {
        String encrypted = passwordEncoder.encode(senha);
        return "Original: " + senha + " | Encrypted: " + encrypted + " | Length: " + encrypted.length();
    }

    @PostMapping("/verify")
    public String verifyPassword(@RequestParam String senha, @RequestParam String hash) {
        boolean matches = passwordEncoder.matches(senha, hash);
        return "Password: " + senha + " | Hash: " + hash + " | Matches: " + matches;
    }
}
