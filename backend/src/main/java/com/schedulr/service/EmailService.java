package com.schedulr.service;

import com.schedulr.entity.EmailLog;
import com.schedulr.entity.Booking;
import com.schedulr.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final EmailLogRepository emailLogRepository;

    @Value("${spring.mail.username:noreply@schedulr.com}")
    private String fromEmail;

    private JavaMailSender mailSender;


    // Optional injection - won't fail if mail not configured
    public EmailService(EmailLogRepository emailLogRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false) JavaMailSender mailSender) {
        this.emailLogRepository = emailLogRepository;
        this.mailSender = mailSender;
    }

    @Async
    public void sendBookingConfirmationToGuest(Booking booking) {
        String subject = "Meeting Confirmed: " + booking.getEventType().getName();
        String body = buildGuestConfirmationEmail(booking);
        sendEmail(booking.getGuestEmail(), subject, body, "BOOKING_CONFIRMATION_GUEST", booking.getId());
    }

    @Async
    public void sendBookingConfirmationToHost(Booking booking) {
        String subject = "New Meeting Booked: " + booking.getEventType().getName();
        String body = buildHostConfirmationEmail(booking);
        sendEmail(booking.getHost().getEmail(), subject, body, "BOOKING_CONFIRMATION_HOST", booking.getId());
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        String subject = "Meeting Cancelled: " + booking.getEventType().getName();
        String body = "Your meeting scheduled for " + booking.getStartTime() + " has been cancelled.";
        sendEmail(booking.getGuestEmail(), subject, body, "BOOKING_CANCELLATION", booking.getId());
        sendEmail(booking.getHost().getEmail(), subject, body, "BOOKING_CANCELLATION", booking.getId());
    }

    private void sendEmail(String to, String subject, String body, String emailType, Long bookingId) {
        String status = "SENT";
        String errorMessage = null;

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Email sent to: {} | Type: {}", to, emailType);
            } else {
                log.info("[EMAIL MOCK] To: {} | Subject: {} | Type: {}", to, subject, emailType);
            }
        } catch (Exception e) {
            status = "FAILED";
            errorMessage = e.getMessage();
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }

        EmailLog emailLog = EmailLog.builder()
                .recipientEmail(to)
                .subject(subject)
                .body(body)
                .emailType(emailType)
                .status(status)
                .errorMessage(errorMessage)
                .bookingId(bookingId)
                .build();
        emailLogRepository.save(emailLog);
    }

    private String buildGuestConfirmationEmail(Booking booking) {
        return String.format("""
                Hi %s,

                Your meeting has been confirmed!

                Meeting: %s
                Host: %s
                Date & Time: %s - %s
                %s

                Notes: %s

                Thank you for using Schedulr!
                """,
                booking.getGuestName(),
                booking.getEventType().getName(),
                booking.getHost().getName(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getMeetingLink() != null ? "Meeting Link: " + booking.getMeetingLink() : "",
                booking.getNotes() != null ? booking.getNotes() : "None");
    }

    private String buildHostConfirmationEmail(Booking booking) {
        return String.format("""
                Hi %s,

                You have a new meeting booked!

                Meeting: %s
                Guest: %s (%s)
                Date & Time: %s - %s
                Notes: %s
                """,
                booking.getHost().getName(),
                booking.getEventType().getName(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getNotes() != null ? booking.getNotes() : "None");
    }
}
