package FirstSpring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private String topStoreName;
    private BigDecimal topStoreRevenue;    // Matching AnalyticsServiceImpl
    private BigDecimal totalSystemRevenue; // Matching AnalyticsServiceImpl
    private Integer totalSystemOrders;
    private List<StorePerformanceDto> storeRankings;
}