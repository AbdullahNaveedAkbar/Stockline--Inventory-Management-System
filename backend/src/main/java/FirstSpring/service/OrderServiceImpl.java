package FirstSpring.service;

import FirstSpring.dto.CreateOrderRequest;
import FirstSpring.entity.Order;
import FirstSpring.entity.OrderItem;
import FirstSpring.entity.OrderStatus;
import FirstSpring.entity.Product;
import FirstSpring.repository.OrderRepository;
import FirstSpring.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Order createOrder(String storeId, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create an order with no items.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(Long.valueOf(itemReq.getProductId()))
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + itemReq.getProductId()));

            // 1. Stock Check
            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName() +
                        ". Requested: " + itemReq.getQuantity() + ", Available: " + product.getStock());
            }

            // 2. Deduct Inventory Stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            // 3. Calculate Item Totals
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            // 4. Create Snapshot Order Item
            OrderItem orderItem = OrderItem.builder()
                    .productId((product.getId()))
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .totalPrice(lineTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // Calculate Tax & Final Total
        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(taxRate.divide(BigDecimal.valueOf(100)));
        BigDecimal total = subtotal.add(tax);

        // Build & Save Order Entity
        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .storeId(Long.valueOf(storeId))
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName() : "Walk-in Customer")
                .customerEmail(request.getCustomerEmail())
                .status(OrderStatus.COMPLETED)
                .subtotal(subtotal)
                .tax(tax)
                .total(total)
                .items(orderItems)
                .build();

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByStore(String storeId) {
        return orderRepository.findByStoreIdOrderByCreatedAtDesc(Long.valueOf(storeId));
    }

    @Override
    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
    }
}