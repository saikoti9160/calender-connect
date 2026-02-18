package com.schedulr.service;

import com.schedulr.dto.availability.AvailabilityDto;
import com.schedulr.dto.availability.AvailabilityRequest;
import com.schedulr.entity.AvailabilityRule;
import com.schedulr.entity.User;
import com.schedulr.repository.AvailabilityRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {

    private final AvailabilityRuleRepository availabilityRuleRepository;
    private final UserService userService;

    public List<AvailabilityDto> getMyAvailability() {
        User user = userService.getCurrentUser();
        return availabilityRuleRepository.findByUserId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AvailabilityDto> getAvailabilityByUserId(Long userId) {
        return availabilityRuleRepository.findByUserIdAndIsAvailableTrue(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AvailabilityDto> saveAvailability(List<AvailabilityRequest> requests) {
        User user = userService.getCurrentUser();
        availabilityRuleRepository.deleteByUserId(user.getId());

        List<AvailabilityRule> rules = requests.stream().map(req -> AvailabilityRule.builder()
                .user(user)
                .dayOfWeek(req.getDayOfWeek().toUpperCase())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .isAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : true)
                .build()).collect(Collectors.toList());

        List<AvailabilityRule> saved = availabilityRuleRepository.saveAll(rules);
        log.info("Availability saved for user: {}", user.getEmail());
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    public AvailabilityDto toDto(AvailabilityRule rule) {
        return AvailabilityDto.builder()
                .id(rule.getId())
                .dayOfWeek(rule.getDayOfWeek())
                .startTime(rule.getStartTime())
                .endTime(rule.getEndTime())
                .isAvailable(rule.getIsAvailable())
                .build();
    }
}
