package com.schedulr.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private Long hostId;
    private String hostName;
    private String hostEmail;
    private Long eventTypeId;
    private String eventTypeName;
    private Integer durationMinutes;
    private String guestName;
    private String guestEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String notes;
    private String meetingLink;
    private LocalDateTime createdAt;
}
