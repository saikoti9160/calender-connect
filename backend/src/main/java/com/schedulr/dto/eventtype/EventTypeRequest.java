package com.schedulr.dto.eventtype;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EventTypeRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;

    private String locationType = "CUSTOM";
    private String locationDetails;
    private Integer bufferBefore = 0;
    private Integer bufferAfter = 0;
    private String color = "#3B82F6";
}
