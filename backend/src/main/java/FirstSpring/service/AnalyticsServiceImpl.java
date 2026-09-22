package FirstSpring.service;

import FirstSpring.dto.AnalyticsSummaryDto;
import FirstSpring.dto.StorePerformanceDto;
import FirstSpring.entity.Order;
import FirstSpring.entity.Store;
import FirstSpring.repository.OrderRepository;
import FirstSpring.repository.StoreRepository;
import FirstSpring.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;

    @Override
    public AnalyticsSummaryDto getDailySummary(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        // Query full 24-hour window from 00:00:00 to 23:59:59 (next day 00:00:00)
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay();

        // Fetches all orders placed today across the system
        List<Order> dailyOrders = orderRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfDay, endOfDay);

        if (dailyOrders.isEmpty()) {
            return AnalyticsSummaryDto.builder()
                    .topStoreName("N/A")
                    .topStoreRevenue(BigDecimal.ZERO)
                    .totalSystemRevenue(BigDecimal.ZERO)
                    .totalSystemOrders(0)
                    .storeRankings(Collections.emptyList())
                    .build();
        }

        // Fetch all registered stores to map IDs to Store Names
        Map<Long, String> storeNameMap = storeRepository.findAll().stream()
                .collect(Collectors.toMap(Store::getId, Store::getName));

        // Group orders by storeId
        Map<Long, List<Order>> ordersByStore = dailyOrders.stream()
                .collect(Collectors.groupingBy(Order::getStoreId));

        List<StorePerformanceDto> storeRankings = new ArrayList<>();
        BigDecimal totalSystemRevenue = BigDecimal.ZERO;

        for (Map.Entry<Long, List<Order>> entry : ordersByStore.entrySet()) {
            Long storeId = entry.getKey();
            List<Order> storeOrders = entry.getValue();

            BigDecimal storeRevenue = storeOrders.stream()
                    .map(Order::getTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            totalSystemRevenue = totalSystemRevenue.add(storeRevenue);

            storeRankings.add(StorePerformanceDto.builder()
                    .storeId(storeId)
                    .storeName(storeNameMap.getOrDefault(storeId, "Unknown Store (" + storeId + ")"))
                    .totalRevenue(storeRevenue)
                    .totalOrders(storeOrders.size())
                    .build());
        }

        // Sort ranking list by revenue in descending order
        storeRankings.sort(Comparator.comparing(StorePerformanceDto::getTotalRevenue).reversed());

        StorePerformanceDto topStore = storeRankings.get(0);

        return AnalyticsSummaryDto.builder()
                .topStoreName(topStore.getStoreName())
                .topStoreRevenue(topStore.getTotalRevenue())
                .totalSystemRevenue(totalSystemRevenue)
                .totalSystemOrders(dailyOrders.size())
                .storeRankings(storeRankings)
                .build();
    }
}