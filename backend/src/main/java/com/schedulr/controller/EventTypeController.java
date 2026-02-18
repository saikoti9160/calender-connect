package com.schedulr.controller;

import com.schedulr.dto.eventtype.EventTypeDto;
import com.schedulr.dto.eventtype.EventTypeRequest;
import com.schedulr.service.EventTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/event-types")
@RequiredArgsConstructor
public class EventTypeController {

    private final EventTypeService eventTypeService;

    @GetMapping
    public ResponseEntity<List<EventTypeDto>> getMyEventTypes() {
        return ResponseEntity.ok(eventTypeService.getMyEventTypes());
    }

    @PostMapping
    public ResponseEntity<EventTypeDto> createEventType(@Valid @RequestBody EventTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventTypeService.createEventType(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventTypeDto> updateEventType(@PathVariable Long id,
            @Valid @RequestBody EventTypeRequest request) {
        return ResponseEntity.ok(eventTypeService.updateEventType(id, request));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<EventTypeDto> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(eventTypeService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventType(@PathVariable Long id) {
        eventTypeService.deleteEventType(id);
        return ResponseEntity.noContent().build();
    }
}
