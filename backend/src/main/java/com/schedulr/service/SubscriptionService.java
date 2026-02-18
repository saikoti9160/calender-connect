package com.schedulr.service;

import com.schedulr.entity.Subscription;
import com.schedulr.entity.User;
import com.schedulr.exception.ResourceNotFoundException;
import com.schedulr.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserService userService;

    public Subscription getMySubscription() {
        User user = userService.getCurrentUser();
        return subscriptionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }

    public String getMyPlan() {
        try {
            return getMySubscription().getPlan();
        } catch (Exception e) {
            return "FREE";
        }
    }

    @Transactional
    public Subscription upgradePlan(String plan) {
        User user = userService.getCurrentUser();
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(Subscription.builder().user(user).build());

        subscription.setPlan(plan.toUpperCase());
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(LocalDateTime.now());
        if (!"FREE".equals(plan.toUpperCase())) {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        }

        log.info("Subscription upgraded to {} for user: {}", plan, user.getEmail());
        return subscriptionRepository.save(subscription);
    }
}
