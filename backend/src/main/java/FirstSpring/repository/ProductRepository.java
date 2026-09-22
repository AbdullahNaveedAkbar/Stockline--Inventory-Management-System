package FirstSpring.repository;

import FirstSpring.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    // Fetch all products across all categories for a specific store
    @Query("SELECT p FROM Product p WHERE p.category.store.id = :storeId")
    List<Product> findByStoreId(@Param("storeId") Long storeId);

    // Fetch low-stock products (< threshold) globally
    List<Product> findByStockLessThanEqual(Integer threshold);

    // Navigates: product.category.store.id
    List<Product> findByCategoryStoreIdAndStockLessThanEqual(Long storeId, Integer threshold);
   // Fetch low-stock products (< threshold) for a specific store
    @Query("SELECT p FROM Product p WHERE p.category.store.id = :storeId AND p.stock < :threshold")
    List<Product> findLowStockByStoreId(@Param("storeId") Long storeId, @Param("threshold") Integer threshold);
}