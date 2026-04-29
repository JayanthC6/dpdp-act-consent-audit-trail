package com.internship.tool.repository;

import com.internship.tool.entity.ConsentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, Long> {

    // get all active records with pagination
    Page<ConsentRecord> findByIsActiveTrue(Pageable pageable);

    // search by keyword across multiple fields
    @Query("""
        SELECT c FROM ConsentRecord c
        WHERE c.isActive = true
        AND (:q IS NULL OR
            LOWER(c.dataPrincipalName) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(c.dataFiduciaryName) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(c.purpose) LIKE LOWER(CONCAT('%', :q, '%'))
        )
        AND (:status IS NULL OR c.consentStatus = :status)
        AND (:from IS NULL OR c.createdAt >= :from)
        AND (:to IS NULL OR c.createdAt <= :to)
        """)
    Page<ConsentRecord> searchRecords(
        @Param("q") String q,
        @Param("status") String status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

    // count by status for dashboard stats
    long countByConsentStatusAndIsActiveTrue(String consentStatus);

    // count all active records
    long countByIsActiveTrue();
}