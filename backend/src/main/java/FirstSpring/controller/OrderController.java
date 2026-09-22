package FirstSpring.controller;

import FirstSpring.dto.CreateOrderRequest;
import FirstSpring.entity.Order;
import FirstSpring.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/stores/{storeId}/orders
     * Creates a new sale transaction, deducts stock, and saves order details.
     * Allowed: CUSTOMER, MANAGER, ADMIN
     */
    @PostMapping("/stores/{storeId}/orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> createOrder(
            @PathVariable String storeId,
            @RequestBody CreateOrderRequest request) {
        try {
            Order createdOrder = orderService.createOrder(storeId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while processing the order."));
        }
    }

    /**
     * GET /api/stores/{storeId}/orders
     * Retrieves all past orders/sales for a specific store.
     * Allowed: MANAGER, ADMIN
     */
    @GetMapping("/stores/{storeId}/orders")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<Order>> getOrdersByStore(@PathVariable String storeId) {
        return ResponseEntity.ok(orderService.getOrdersByStore(storeId));
    }

    /**
     * GET /api/orders/{orderId}
     * Retrieves a single order by its unique ID.
     * Allowed: CUSTOMER, MANAGER, ADMIN
     */
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}