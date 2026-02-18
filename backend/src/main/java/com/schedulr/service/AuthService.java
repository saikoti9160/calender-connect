package com.schedulr.service;

import com.schedulr.dto.auth.AuthResponse;
import com.schedulr.dto.auth.LoginRequest;
import com.schedulr.dto.auth.RegisterRequest;
import com.schedulr.entity.Subscription;
import com.schedulr.entity.User;
import com.schedulr.exception.ConflictException;
import com.schedulr.repository.SubscriptionRepository;
import com.schedulr.repository.UserRepository;
import com.schedulr.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken: " + request.getUsername());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername().toLowerCase())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .role("USER")
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Create free subscription
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan("FREE")
                .status("ACTIVE")
                .startDate(LocalDateTime.now())
                .build();
        subscriptionRepository.save(subscription);

        String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("LOGIN ATTEMPT: email={}", request.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            String token = jwtTokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
            log.info("LOGIN SUCCESS: email={}, role={}", user.getEmail(), user.getRole());
            return buildAuthResponse(user, token);
        } catch (Exception e) {
            log.error("LOGIN FAILED: email={}, reason={}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .timezone(user.getTimezone())
                .build();
    }
}
