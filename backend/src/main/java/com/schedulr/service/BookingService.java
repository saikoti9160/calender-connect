package com.schedulr.service;

import com.schedulr.dto.booking.BookingDto;
import com.schedulr.dto.booking.BookingRequest;
import com.schedulr.dto.booking.TimeSlotDto;
import com.schedulr.entity.Booking;
import com.schedulr.entity.EventType;
import com.schedulr.entity.User;
import com.schedulr.exception.BadRequestException;
import com.schedulr.exception.ConflictException;
import com.schedulr.exception.ResourceNotFoundException;
import com.schedulr.repository.BookingRepository;
import com.schedulr.repository.EventTypeRepository;
import com.schedulr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventTypeRepository eventTypeRepository;
    private final UserRepository userRepository;
    private final SlotGenerationService slotGenerationService;
    private final EmailService emailService;
    private final UserService userService;

    /**
     * Get available slots for a public booking page.
     */
    public List<TimeSlotDto> getAvailableSlots(String username, Long eventTypeId, LocalDate date) {
        User host = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        EventType eventType = eventTypeRepository.findById(eventTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found: " + eventTypeId));

        if (!eventType.getUser().getId().equals(host.getId())) {
            throw new ResourceNotFoundException("Event type not found for this user");
        }

        LocalDate endDate = date.plusDays(6); // Show 7 days
        return slotGenerationService.generateSlots(eventType, date, endDate)
                .stream().filter(TimeSlotDto::isAvailable).collect(Collectors.toList());
    }

    /**
     * Create a booking (public endpoint).
     */
    @Transactional
    public BookingDto createBooking(String username, BookingRequest request) {
        User host = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        EventType eventType = eventTypeRepository.findById(request.getEventTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found"));

        if (!eventType.getUser().getId().equals(host.getId())) {
            throw new BadRequestException("Event type does not belong to this host");
        }

        if (!eventType.getActive()) {
            throw new BadRequestException("This event type is not currently available");
        }

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(eventType.getDurationMinutes());

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book a slot in the past");
        }

        // Double-booking prevention at service level
        if (!slotGenerationService.isSlotAvailable(host.getId(), startTime, endTime)) {
            throw new ConflictException("This time slot is no longer available. Please choose another.");
        }

        String meetingLink = generateMeetingLink(eventType);

        Booking booking = Booking.builder()
                .host(host)
                .eventType(eventType)
                .guestName(request.getGuestName())
                .guestEmail(request.getGuestEmail())
                .startTime(startTime)
                .endTime(endTime)
                .status("BOOKED")
                .notes(request.getNotes())
                .meetingLink(meetingLink)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created: {} for host: {}", booking.getId(), host.getEmail());

        // Send confirmation emails asynchronously
        emailService.sendBookingConfirmationToGuest(booking);
        emailService.sendBookingConfirmationToHost(booking);

        return toDto(booking);
    }

    /**
     * Get all bookings for the current authenticated user.
     */
    public List<BookingDto> getMyBookings() {
        User user = userService.getCurrentUser();
        return bookingRepository.findByHostIdOrderByStartTimeDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BookingDto> getUpcomingBookings() {
        User user = userService.getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.findUpcomingByHostId(user.getId(), now, now.plusDays(30))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BookingDto> getPastBookings() {
        User user = userService.getCurrentUser();
        return bookingRepository.findPastByHostId(user.getId(), LocalDateTime.now())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, String reason) {
        User user = userService.getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!booking.getHost().getId().equals(user.getId())) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);

        emailService.sendCancellationEmail(booking);
        log.info("Booking cancelled: {}", bookingId);
        return toDto(booking);
    }

    private String generateMeetingLink(EventType eventType) {
        return switch (eventType.getLocationType()) {
            case "ZOOM" -> "https://zoom.us/j/" + System.currentTimeMillis();
            case "GOOGLE_MEET" -> "https://meet.google.com/" + generateMeetCode();
            default -> eventType.getLocationDetails();
        };
    }

    private String generateMeetCode() {
        String chars = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            if (i > 0)
                sb.append("-");
            for (int j = 0; j < 4; j++) {
                sb.append(chars.charAt((int) (Math.random() * chars.length())));
            }
        }
        return sb.toString();
    }

    public BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .hostId(b.getHost().getId())
                .hostName(b.getHost().getName())
                .hostEmail(b.getHost().getEmail())
                .eventTypeId(b.getEventType().getId())
                .eventTypeName(b.getEventType().getName())
                .durationMinutes(b.getEventType().getDurationMinutes())
                .guestName(b.getGuestName())
                .guestEmail(b.getGuestEmail())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .notes(b.getNotes())
                .meetingLink(b.getMeetingLink())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
