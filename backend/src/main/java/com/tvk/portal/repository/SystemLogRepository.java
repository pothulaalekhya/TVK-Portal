package com.tvk.portal.repository;

import com.tvk.portal.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    // Returns the 50 most recent log entries (newest first)
    List<SystemLog> findTop50ByOrderByIdDesc();

    long countBy();
}
