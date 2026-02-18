package com.schedulr.service;

import com.schedulr.dto.booking.TimeSlotDto;
import com.schedulr.entity.AvailabilityRule;
import com.schedulr.entity.Booking;
import com.schedulr.entity.EventType;
import com.schedulr.repository.AvailabilityRuleRepository;
import com.schedulr.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CRITICAL: Slot Generation Engine
 * Reads availability rules, generates time slots based on event duration,
 * applies buffer times, removes past slots, and removes already booked slots.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlotGenerationService {

    private final AvailabilityRuleRepository availabilityRuleRepository;
    private final BookingRepository bookingRepository;

    /**
     * Generate available slots for a given event type and date range.
     */
    public List<TimeSlotDto> generateSlots(EventType eventType, LocalDate startDate, LocalDate endDate) {
        Long hostId = eventType.getUser().getId();
        int duration = eventType.getDurationMinutes();
        int bufferBefore = eventType.getBufferBefore();
        int bufferAfter = eventType.getBufferAfter();

        List<AvailabilityRule> rules = availabilityRuleRepository.findByUserIdAndIsAvailableTrue(hostId);
        List<Booking> existingBookings = bookingRepository.findBookedSlots(
                hostId,
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay());

        List<TimeSlotDto> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            final LocalDate date = current;
            String dayOfWeek = date.getDayOfWeek().name();

            rules.stream()
                    .filter(r -> r.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                    .findFirst()
                    .ifPresent(rule -> {
                        LocalTime slotStart = rule.getStartTime();
                        LocalTime slotEnd = rule.getEndTime();

                        while (!slotStart.plusMinutes(duration).isAfter(slotEnd)) {
                            LocalDateTime slotStartDt = date.atTime(slotStart);
                            LocalDateTime slotEndDt = slotStartDt.plusMinutes(duration);

                            // Skip past slots
                            if (slotStartDt.isAfter(now)) {
                                // Check for overlapping bookings (including buffers)
                                LocalDateTime effectiveStart = slotStartDt.minusMinutes(bufferBefore);
                                LocalDateTime effectiveEnd = slotEndDt.plusMinutes(bufferAfter);

                                boolean isBooked = existingBookings.stream()
                                        .anyMatch(b -> b.getStartTime().isBefore(effectiveEnd) &&
                                                b.getEndTime().isAfter(effectiveStart));

                                slots.add(TimeSlotDto.builder()
                                        .startTime(slotStartDt)
                                        .endTime(slotEndDt)
                                        .available(!isBooked)
                                        .build());
                            }

                            slotStart = slotStart.plusMinutes(duration + bufferAfter);
                        }
                    });

            current = current.plusDays(1);
        }

        log.debug("Generated {} slots for event type {} from {} to {}", slots.size(), eventType.getId(), startDate,
                endDate);
        return slots;
    }

    /**
     * Check if a specific slot is available.
     */
    public boolean isSlotAvailable(Long hostId, LocalDateTime startTime, LocalDateTime endTime) {
        return !bookingRepository.existsOverlappingBooking(hostId, startTime, endTime);
    }
}
