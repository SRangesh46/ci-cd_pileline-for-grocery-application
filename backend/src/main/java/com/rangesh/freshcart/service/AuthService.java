package com.rangesh.freshcart.service;

import com.rangesh.freshcart.dto.*;
import com.rangesh.freshcart.entity.User;
import com.rangesh.freshcart.repository.UserRepository;
import com.rangesh.freshcart.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new RuntimeException("An account with this email already exists.");
        }

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user = users.save(user);

        String token = jwtService.generate(user.getId(), user.getName(), user.getEmail());
        return new AuthResponse(
            "Registration successful",
            token,
            new UserResponse(user.getId(), user.getName(), user.getEmail())
        );
    }

    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email())
            .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String token = jwtService.generate(user.getId(), user.getName(), user.getEmail());
        return new AuthResponse(
            "Login successful",
            token,
            new UserResponse(user.getId(), user.getName(), user.getEmail())
        );
    }
}
