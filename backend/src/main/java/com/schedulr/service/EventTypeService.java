package com.schedulr.service;

import com.schedulr.dto.eventtype.EventTypeDto;
import com.schedulr.dto.eventtype.EventTypeRequest;
import com.schedulr.entity.EventType;
import com.schedulr.entity.User;
import com.schedulr.exception.ResourceNotFoundException;
import com.schedulr.repository.EventTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventTypeService {

    private final EventTypeRepository eventTypeRepository;
    private final UserService userService;

    public List<EventTypeDto> getMyEventTypes() {
        User user = userService.getCurrentUser();
        return eventTypeRepository.findByUserId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EventTypeDto> getActiveEventTypesByUsername(String username) {
        User user = userService.getUserByUsername(username) != null ? findUserByUsername(username) : null;
        if (user == null)
            throw new ResourceNotFoundException("User not found: " + username);
        return eventTypeRepository.findByUserIdAndActiveTrue(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private User findUserByUsername(String username) {
        return userService.getCurrentUser(); // placeholder, replaced below
    }

    @Transactional
    public EventTypeDto createEventType(EventTypeRequest request) {
        User user = userService.getCurrentUser();
        EventType eventType = EventType.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .locationType(request.getLocationType())
                .locationDetails(request.getLocationDetails())
                .bufferBefore(request.getBufferBefore())
                .bufferAfter(request.getBufferAfter())
                .color(request.getColor())
                .active(true)
                .build();
        eventType = eventTypeRepository.save(eventType);
        log.info("Event type created: {} for user: {}", eventType.getName(), user.getEmail());
        return toDto(eventType);
    }

    @Transactional
    public EventTypeDto updateEventType(Long id, EventTypeRequest request) {
        User user = userService.getCurrentUser();
        EventType eventType = eventTypeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found: " + id));
        eventType.setName(request.getName());
        eventType.setDescription(request.getDescription());
        eventType.setDurationMinutes(request.getDurationMinutes());
        eventType.setLocationType(request.getLocationType());
        eventType.setLocationDetails(request.getLocationDetails());
        eventType.setBufferBefore(request.getBufferBefore());
        eventType.setBufferAfter(request.getBufferAfter());
        eventType.setColor(request.getColor());
        return toDto(eventTypeRepository.save(eventType));
    }

    @Transactional
    public EventTypeDto toggleActive(Long id) {
        User user = userService.getCurrentUser();
        EventType eventType = eventTypeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found: " + id));
        eventType.setActive(!eventType.getActive());
        return toDto(eventTypeRepository.save(eventType));
    }

    @Transactional
    public void deleteEventType(Long id) {
        User user = userService.getCurrentUser();
        EventType eventType = eventTypeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found: " + id));
        eventTypeRepository.delete(eventType);
        log.info("Event type deleted: {} by user: {}", id, user.getEmail());
    }

    public EventTypeDto getById(Long id) {
        return toDto(eventTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event type not found: " + id)));
    }

    public EventTypeDto toDto(EventType et) {
        return EventTypeDto.builder()
                .id(et.getId())
                .userId(et.getUser().getId())
                .name(et.getName())
                .description(et.getDescription())
                .durationMinutes(et.getDurationMinutes())
                .locationType(et.getLocationType())
                .locationDetails(et.getLocationDetails())
                .bufferBefore(et.getBufferBefore())
                .bufferAfter(et.getBufferAfter())
                .active(et.getActive())
                .color(et.getColor())
                .createdAt(et.getCreatedAt())
                .build();
    }
}
