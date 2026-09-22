package FirstSpring.controller;

import FirstSpring.dto.StoreDto;
import FirstSpring.service.StoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    // Create store assigned to a specific owner (User) - Restricted to MANAGER or ADMIN
    @PostMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<StoreDto> createStore(@PathVariable Long userId, @RequestBody StoreDto storeDto) {
        StoreDto created = storeService.createStore(userId, storeDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get store by ID (includes populated categories & products) - Public access
    @GetMapping("/{id}")
    public ResponseEntity<StoreDto> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    // Get all stores for a specific user/owner - Public access
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StoreDto>> getStoresByOwner(@PathVariable Long userId) {
        return ResponseEntity.ok(storeService.getStoresByOwner(userId));
    }

    // Get all stores in system - Public access
    @GetMapping
    public ResponseEntity<List<StoreDto>> getAllStores() {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    // Update store details - Restricted to MANAGER or ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<StoreDto> updateStore(@PathVariable Long id, @RequestBody StoreDto storeDto) {
        return ResponseEntity.ok(storeService.updateStore(id, storeDto));
    }

    // Delete store - Restricted to ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
        return ResponseEntity.ok("Store deleted successfully");
    }
}