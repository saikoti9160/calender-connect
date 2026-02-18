package com.schedulr.repository;

import com.schedulr.entity.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, Long> {
    List<Integration> findByUserId(Long userId);

    Optional<Integration> findByUserIdAndProvider(Long userId, String provider);
}
