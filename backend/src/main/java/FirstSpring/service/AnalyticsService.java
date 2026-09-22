package FirstSpring.service;

import FirstSpring.dto.AnalyticsSummaryDto;

import java.time.LocalDate;

public interface AnalyticsService {
    AnalyticsSummaryDto getDailySummary(LocalDate date);
}