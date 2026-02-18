package com.schedulr.repository;

import com.schedulr.entity.AvailabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, Long> {
    List<AvailabilityRule> findByUserId(Long userId);

    List<AvailabilityRule> findByUserIdAndIsAvailableTrue(Long userId);

    Optional<AvailabilityRule> findByUserIdAndDayOfWeek(Long userId, String dayOfWeek);

    void deleteByUserId(Long userId);
}
