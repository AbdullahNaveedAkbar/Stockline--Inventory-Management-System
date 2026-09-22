package FirstSpring.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String customerName;
    private String customerEmail;
    private BigDecimal taxRate; // e.g., 5.0 for 5% tax

    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}