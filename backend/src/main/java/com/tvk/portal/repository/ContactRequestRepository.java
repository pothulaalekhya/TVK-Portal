package com.tvk.portal.repository;

import com.tvk.portal.model.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, String> {

    long countByStatus(String status);
}
