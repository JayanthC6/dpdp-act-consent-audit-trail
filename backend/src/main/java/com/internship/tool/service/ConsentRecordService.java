package com.internship.tool.service;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.entity.ConsentRecord;
import com.internship.tool.repository.AuditLogRepository;
import com.internship.tool.repository.ConsentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConsentRecordService {

    private final ConsentRecordRepository consentRecordRepository;
    private final AuditLogRepository auditLogRepository;

    // get all records with search and filters
    public Page<ConsentRecord> getAllRecords(
            String q, String status,
            String from, String to,
            int page, int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        LocalDateTime fromDate = (from != null && !from.isEmpty())
                ? LocalDate.parse(from).atStartOfDay() : null;
        LocalDateTime toDate = (to != null && !to.isEmpty())
                ? LocalDate.parse(to).atTime(23, 59, 59) : null;

        String searchQ = (q != null && !q.isEmpty()) ? q : null;
        String searchStatus = (status != null && !status.isEmpty()) ? status : null;

        return consentRecordRepository.searchRecords(
                searchQ, searchStatus, fromDate, toDate, pageable);
    }

    // get single record by id
    public Optional<ConsentRecord> getById(Long id) {
        return consentRecordRepository.findById(id)
                .filter(ConsentRecord::getIsActive);
    }

    // create new consent record
    public ConsentRecord create(ConsentRecord record, String performedBy) {
        record.setIsActive(true);
        record.setConsentStatus("PENDING");
        ConsentRecord saved = consentRecordRepository.save(record);

        // log the create action
        logAudit(saved.getId(), "CREATE", performedBy,
                null, saved.getConsentStatus(), "Record created");

        return saved;
    }

    // update existing record
    public ConsentRecord update(Long id, ConsentRecord updated, String performedBy) {
        ConsentRecord existing = consentRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        String oldStatus = existing.getConsentStatus();

        existing.setDataPrincipalId(updated.getDataPrincipalId());
        existing.setDataPrincipalName(updated.getDataPrincipalName());
        existing.setDataPrincipalEmail(updated.getDataPrincipalEmail());
        existing.setDataFiduciaryId(updated.getDataFiduciaryId());
        existing.setDataFiduciaryName(updated.getDataFiduciaryName());
        existing.setPurpose(updated.getPurpose());
        existing.setDataCategories(updated.getDataCategories());
        existing.setConsentDate(updated.getConsentDate());
        existing.setExpiryDate(updated.getExpiryDate());

        // log status change separately if status changed
        if (!oldStatus.equals(updated.getConsentStatus())) {
            existing.setConsentStatus(updated.getConsentStatus());
            logAudit(id, "STATUS_CHANGE", performedBy,
                    oldStatus, updated.getConsentStatus(), "Status updated");
        } else {
            logAudit(id, "UPDATE", performedBy,
                    null, null, "Record updated");
        }

        return consentRecordRepository.save(existing);
    }

    // soft delete
    public void delete(Long id, String performedBy) {
        ConsentRecord record = consentRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setIsActive(false);
        consentRecordRepository.save(record);

        logAudit(id, "DELETE", performedBy,
                null, null, "Record soft deleted");
    }

    // update AI fields after AI service responds
    public ConsentRecord updateAiFields(Long id, String description,
                                         Integer score, Boolean isFallback) {
        ConsentRecord record = consentRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setAiDescription(description);
        record.setAiScore(score);
        record.setIsFallback(isFallback);

        return consentRecordRepository.save(record);
    }

    // dashboard stats
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", consentRecordRepository.countByIsActiveTrue());
        stats.put("granted", consentRecordRepository
                .countByConsentStatusAndIsActiveTrue("GRANTED"));
        stats.put("revoked", consentRecordRepository
                .countByConsentStatusAndIsActiveTrue("REVOKED"));
        stats.put("pending", consentRecordRepository
                .countByConsentStatusAndIsActiveTrue("PENDING"));
        stats.put("expired", consentRecordRepository
                .countByConsentStatusAndIsActiveTrue("EXPIRED"));
        return stats;
    }

    // internal audit log helper
    private void logAudit(Long recordId, String action,
                           String performedBy, String oldValue,
                           String newValue, String remarks) {
        AuditLog log = AuditLog.builder()
                .consentRecordId(recordId)
                .action(action)
                .performedBy(performedBy)
                .oldValue(oldValue)
                .newValue(newValue)
                .remarks(remarks)
                .build();
        auditLogRepository.save(log);
    }
}