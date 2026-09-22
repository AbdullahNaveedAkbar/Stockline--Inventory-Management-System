package FirstSpring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StorePerformanceDto {
    private Long storeId;
    private String storeName;
    private BigDecimal totalRevenue;
    private Integer totalOrders;
}