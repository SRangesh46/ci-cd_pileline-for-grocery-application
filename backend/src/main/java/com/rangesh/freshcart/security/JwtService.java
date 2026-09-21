package com.rangesh.freshcart.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final String secret = System.getenv().getOrDefault(
        "JWT_SECRET",
        "change-this-development-secret-to-a-long-random-value-1234567890"
    );

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generate(Integer id, String name, String email) {
        return Jwts.builder()
            .subject(String.valueOf(id))
            .claim("name", name)
            .claim("email", email)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 2L * 24 * 60 * 60 * 1000))
            .signWith(key())
            .compact();
    }

    public Integer getUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key()).build()
            .parseSignedClaims(token).getPayload();
        return Integer.valueOf(claims.getSubject());
    }
}
