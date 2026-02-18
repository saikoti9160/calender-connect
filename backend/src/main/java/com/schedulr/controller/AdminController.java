package com.schedulr.controller;

import com.schedulr.dto.user.UserDto;
import com.schedulr.entity.Payment;
import com.schedulr.entity.Subscription;
import com.schedulr.repository.PaymentRepository;
import com.schedulr.repository.SubscriptionRepository;
import com.schedulr.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/toggle")
    public ResponseEntity<UserDto> toggleUserActive(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.toggleUserActive(userId));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionRepository.findAll());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userService.getAllUsers().size();
        long totalSubscriptions = subscriptionRepository.count();
        long totalPayments = paymentRepository.count();
        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalSubscriptions", totalSubscriptions,
                "totalPayments", totalPayments));
    }
}
