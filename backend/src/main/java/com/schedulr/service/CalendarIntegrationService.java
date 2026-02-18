package com.schedulr.service;

import com.schedulr.entity.Integration;
import com.schedulr.entity.User;
import com.schedulr.repository.IntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Calendar Integration Service
 * Manages Google Calendar and Zoom integrations.
 * Full OAuth flow requires Google/Zoom API credentials.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarIntegrationService {

    private final IntegrationRepository integrationRepository;
    private final UserService userService;

    public List<Integration> getMyIntegrations() {
        User user = userService.getCurrentUser();
        return integrationRepository.findByUserId(user.getId());
    }

    public Optional<Integration> getIntegration(String provider) {
        User user = userService.getCurrentUser();
        return integrationRepository.findByUserIdAndProvider(user.getId(), provider);
    }

    /**
     * Save OAuth tokens after successful OAuth flow.
     */
    public Integration saveIntegration(String provider, String accessToken, String refreshToken) {
        User user = userService.getCurrentUser();
        Integration integration = integrationRepository
                .findByUserIdAndProvider(user.getId(), provider)
                .orElse(Integration.builder().user(user).provider(provider).build());

        integration.setAccessToken(accessToken);
        integration.setRefreshToken(refreshToken);
        integration.setActive(true);

        log.info("Integration saved: {} for user: {}", provider, user.getEmail());
        return integrationRepository.save(integration);
    }

    public void disconnectIntegration(String provider) {
        User user = userService.getCurrentUser();
        integrationRepository.findByUserIdAndProvider(user.getId(), provider)
                .ifPresent(integration -> {
                    integration.setActive(false);
                    integration.setAccessToken(null);
                    integration.setRefreshToken(null);
                    integrationRepository.save(integration);
                    log.info("Integration disconnected: {} for user: {}", provider, user.getEmail());
                });
    }

    /**
     * Create a Google Calendar event (stub - requires Google API credentials).
     */
    public String createGoogleCalendarEvent(Long bookingId) {
        log.info("Creating Google Calendar event for booking: {}", bookingId);
        // TODO: Implement with Google Calendar API
        return "https://calendar.google.com/event?id=stub_" + bookingId;
    }

    /**
     * Create a Zoom meeting (stub - requires Zoom API credentials).
     */
    public String createZoomMeeting(Long bookingId) {
        log.info("Creating Zoom meeting for booking: {}", bookingId);
        // TODO: Implement with Zoom API
        return "https://zoom.us/j/" + System.currentTimeMillis();
    }
}
