package com.schedulr.controller;

import com.schedulr.dto.availability.AvailabilityDto;
import com.schedulr.dto.availability.AvailabilityRequest;
import com.schedulr.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<List<AvailabilityDto>> getMyAvailability() {
        return ResponseEntity.ok(availabilityService.getMyAvailability());
    }

    @PostMapping
    public ResponseEntity<List<AvailabilityDto>> saveAvailability(
            @Valid @RequestBody List<AvailabilityRequest> requests) {
        return ResponseEntity.ok(availabilityService.saveAvailability(requests));
    }
}
