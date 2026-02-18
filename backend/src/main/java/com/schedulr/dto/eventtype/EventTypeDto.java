package com.schedulr.dto.eventtype;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventTypeDto {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Integer durationMinutes;
    private String locationType;
    private String locationDetails;
    private Integer bufferBefore;
    private Integer bufferAfter;
    private Boolean active;
    private String color;
    private LocalDateTime createdAt;
}
