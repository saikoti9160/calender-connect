package com.schedulr.config;

import com.schedulr.entity.AvailabilityRule;
import com.schedulr.entity.EventType;
import com.schedulr.entity.Subscription;
import com.schedulr.entity.User;
import com.schedulr.repository.AvailabilityRuleRepository;
import com.schedulr.repository.EventTypeRepository;
import com.schedulr.repository.SubscriptionRepository;
import com.schedulr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * DataInitializer - runs on every startup.
 * Creates default admin user + seed data if they don't already exist.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final EventTypeRepository eventTypeRepository;
    private final AvailabilityRuleRepository availabilityRuleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== DataInitializer: Checking seed data ===");
        createAdminUser();
        log.info("=== DataInitializer: Done ===");
    }

    private void createAdminUser() {
        String adminEmail = "admin@antigravity.com";

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Admin user already exists, skipping seed.");
            return;
        }

        log.info("Creating default admin user: {}", adminEmail);

        // 1. Create User
        User admin = User.builder()
                .name("Super Admin")
                .email(adminEmail)
                .username("admin")
                .password(passwordEncoder.encode("Admin@123"))
                .role("ADMIN")
                .timezone("Asia/Kolkata")
                .active(true)
                .build();
        admin = userRepository.save(admin);
        log.info("Admin user created with ID: {}", admin.getId());

        // 2. Create FREE Subscription
        Subscription subscription = Subscription.builder()
                .user(admin)
                .plan("FREE")
                .status("ACTIVE")
                .startDate(LocalDateTime.now())
                .build();
        subscriptionRepository.save(subscription);
        log.info("Subscription created for admin.");

        // 3. Seed default event type
        EventType eventType = EventType.builder()
                .user(admin)
                .name("30 Min Meeting")
                .description("A quick 30-minute meeting to connect and discuss.")
                .durationMinutes(30)
                .locationType("GOOGLE_MEET")
                .bufferBefore(0)
                .bufferAfter(0)
                .color("#6366f1")
                .active(true)
                .build();
        eventTypeRepository.save(eventType);
        log.info("Default event type created.");

        // 4. Seed Monday–Friday availability (09:00–17:00)
        List<String> workdays = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");
        List<String> weekend = List.of("SATURDAY", "SUNDAY");

        for (String day : workdays) {
            AvailabilityRule rule = AvailabilityRule.builder()
                    .user(admin)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .isAvailable(true)
                    .build();
            availabilityRuleRepository.save(rule);
        }
        for (String day : weekend) {
            AvailabilityRule rule = AvailabilityRule.builder()
                    .user(admin)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .isAvailable(false)
                    .build();
            availabilityRuleRepository.save(rule);
        }
        log.info("Availability rules seeded for admin.");

        log.info("=================================================");
        log.info("  DEFAULT ADMIN CREDENTIALS:");
        log.info("  Email   : {}", adminEmail);
        log.info("  Password: Admin@123");
        log.info("=================================================");
    }
}
