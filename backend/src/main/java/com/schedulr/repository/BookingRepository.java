package com.schedulr.repository;

import com.schedulr.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByHostIdOrderByStartTimeDesc(Long hostId);

    List<Booking> findByHostIdAndStatusOrderByStartTimeAsc(Long hostId, String status);

    @Query("SELECT b FROM Booking b WHERE b.host.id = :hostId AND b.startTime >= :from AND b.startTime <= :to AND b.status = 'BOOKED' ORDER BY b.startTime ASC")
    List<Booking> findUpcomingByHostId(@Param("hostId") Long hostId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT b FROM Booking b WHERE b.host.id = :hostId AND b.startTime < :now AND b.status != 'CANCELLED' ORDER BY b.startTime DESC")
    List<Booking> findPastByHostId(@Param("hostId") Long hostId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.host.id = :hostId AND b.status = 'BOOKED' AND " +
            "((b.startTime < :endTime AND b.endTime > :startTime))")
    boolean existsOverlappingBooking(@Param("hostId") Long hostId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.host.id = :hostId AND b.status = 'BOOKED' AND " +
            "b.startTime >= :from AND b.startTime <= :to")
    List<Booking> findBookedSlots(@Param("hostId") Long hostId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
