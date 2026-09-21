package com.rangesh.freshcart.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "OK", "message", "Grocery backend API is running.");
    }
}
