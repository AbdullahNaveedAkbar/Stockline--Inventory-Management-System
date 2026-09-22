package FirstSpring.controller;

import FirstSpring.dto.ProductDto;
import FirstSpring.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create a product under a specific category - Restricted to MANAGER or ADMIN
    @PostMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProductDto> createProduct(@PathVariable Long categoryId,
                                                    @RequestBody ProductDto productDto) {
        ProductDto created = productService.createProduct(categoryId, productDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get product by ID - Public access
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Get products by category - Public access
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    // Get all products for a specific store - Public access
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<ProductDto>> getProductsByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(productService.getProductsByStore(storeId));
    }

    // Alert Endpoint 1: Low-stock products globally - Restricted to MANAGER or ADMIN
    @GetMapping("/alerts/low-stock")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProductDto>> getLowStockProducts(
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }

    // Alert Endpoint 2: Low-stock products for a specific store - Restricted to MANAGER or ADMIN
    @GetMapping("/store/{storeId}/alerts/low-stock")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProductDto>> getLowStockProductsByStore(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(productService.getLowStockProductsByStore(storeId, threshold));
    }

    // Update full product details - Restricted to MANAGER or ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id,
                                                    @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(productService.updateProduct(id, productDto));
    }

    // Quick stock update endpoint - Restricted to MANAGER or ADMIN
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProductDto> updateStock(@PathVariable Long id,
                                                  @RequestParam Integer stock) {
        return ResponseEntity.ok(productService.updateStock(id, stock));
    }

    // Delete product - Restricted to MANAGER or ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}