package com.schedulr.controller;

import com.schedulr.entity.Integration;
import com.schedulr.entity.Subscription;
import com.schedulr.service.CalendarIntegrationService;
import com.schedulr.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/integrations")
@RequiredArgsConstructor
public class IntegrationController {

    private final CalendarIntegrationService integrationService;
    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<Integration>> getMyIntegrations() {
        return ResponseEntity.ok(integrationService.getMyIntegrations());
    }

    @DeleteMapping("/{provider}")
    public ResponseEntity<Void> disconnectIntegration(@PathVariable String provider) {
        integrationService.disconnectIntegration(provider);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/subscription")
    public ResponseEntity<Subscription> getMySubscription() {
        return ResponseEntity.ok(subscriptionService.getMySubscription());
    }

    @PostMapping("/subscription/upgrade")
    public ResponseEntity<Subscription> upgradePlan(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(subscriptionService.upgradePlan(body.get("plan")));
    }
}
