package com.schedulr.repository;

import com.schedulr.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {
    List<EventType> findByUserIdAndActiveTrue(Long userId);

    List<EventType> findByUserId(Long userId);

    Optional<EventType> findByIdAndUserId(Long id, Long userId);
}
