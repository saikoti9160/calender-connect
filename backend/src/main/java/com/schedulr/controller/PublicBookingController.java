package com.schedulr.controller;

import com.schedulr.dto.booking.BookingDto;
import com.schedulr.dto.booking.BookingRequest;
import com.schedulr.dto.booking.TimeSlotDto;
import com.schedulr.dto.eventtype.EventTypeDto;
import com.schedulr.dto.user.UserDto;
import com.schedulr.entity.User;
import com.schedulr.exception.ResourceNotFoundException;
import com.schedulr.repository.EventTypeRepository;
import com.schedulr.repository.UserRepository;
import com.schedulr.service.BookingService;
import com.schedulr.service.EventTypeService;
import com.schedulr.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Public booking endpoints - no authentication required.
 * These power the public booking page: /{username}/{eventTypeSlug}
 */
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicBookingController {

    private final BookingService bookingService;
    private final EventTypeService eventTypeService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final EventTypeRepository eventTypeRepository;

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getPublicProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/{username}/event-types")
    public ResponseEntity<List<EventTypeDto>> getPublicEventTypes(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        List<EventTypeDto> eventTypes = eventTypeRepository.findByUserIdAndActiveTrue(user.getId())
                .stream().map(eventTypeService::toDto).toList();
        return ResponseEntity.ok(eventTypes);
    }

    @GetMapping("/{username}/slots")
    public ResponseEntity<List<TimeSlotDto>> getAvailableSlots(
            @PathVariable String username,
            @RequestParam Long eventTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getAvailableSlots(username, eventTypeId, date));
    }

    @PostMapping("/{username}/book")
    public ResponseEntity<BookingDto> createBooking(@PathVariable String username,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(username, request));
    }
}
