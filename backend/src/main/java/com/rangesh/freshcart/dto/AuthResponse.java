package com.rangesh.freshcart.dto;

public record AuthResponse(String message, String token, UserResponse user) {}
