package FirstSpring.service;

import FirstSpring.dto.StoreDto;
import java.util.List;

public interface StoreService {
    StoreDto createStore(Long userId, StoreDto storeDto);
    StoreDto getStoreById(Long id);
    List<StoreDto> getStoresByOwner(Long userId);
    List<StoreDto> getAllStores();
    StoreDto updateStore(Long id, StoreDto storeDto);
    void deleteStore(Long id);
}