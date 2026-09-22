package FirstSpring.repository;

import FirstSpring.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    // Fetch all orders for a specific store sorted by newest first
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    // Fetch orders within a date range across all stores (Used for Analytics)
    List<Order> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

    // Fetch orders for a specific store within a date range (Used for Store Closing Email)
    List<Order> findByStoreIdAndCreatedAtBetween(Long storeId, LocalDateTime start, LocalDateTime end);

    // JPQL date comparison
    @Query("SELECT o FROM Order o WHERE FUNCTION('DATE', o.createdAt) = :targetDate")
    List<Order> findOrdersByExactDate(@Param("targetDate") LocalDate targetDate);
}