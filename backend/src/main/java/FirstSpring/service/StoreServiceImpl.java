package FirstSpring.service;

import FirstSpring.dto.StoreDto;
import FirstSpring.entity.Store;
import FirstSpring.entity.User;
import FirstSpring.exception.ResourceNotFoundException;
import FirstSpring.mapper.StoreMapper;
import FirstSpring.repository.StoreRepository;
import FirstSpring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreServiceImpl(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StoreDto createStore(Long userId, StoreDto storeDto) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Store store = new Store();
        store.setName(storeDto.getName());
        store.setStoreType(storeDto.getStoreType());
        store.setDescription(storeDto.getDescription());
        store.setImageUrl(storeDto.getImageUrl());
        store.setOpentime(storeDto.getOpentime());
        store.setClosedtime(storeDto.getClosedtime());
        store.setManagerEmail(storeDto.getManagerEmail());
        store.setUser(owner);

        Store savedStore = storeRepository.save(store);
        return StoreMapper.mapToStoreDto(savedStore);
    }

    @Override
    public StoreDto getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return StoreMapper.mapToStoreDto(store);
    }

    @Override
    public List<StoreDto> getStoresByOwner(Long userId) {
        return storeRepository.findByUserId(userId).stream()
                .map(StoreMapper::mapToStoreDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<StoreDto> getAllStores() {
        return storeRepository.findAll().stream()
                .map(StoreMapper::mapToStoreDto)
                .collect(Collectors.toList());
    }

    @Override
    public StoreDto updateStore(Long id, StoreDto storeDto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        if (storeDto.getName() != null) {
            store.setName(storeDto.getName());
        }
        if (storeDto.getDescription() != null) {
            store.setDescription(storeDto.getDescription());
        }
        if (storeDto.getStoreType() != null) {
            store.setStoreType(storeDto.getStoreType());
        }
        if (storeDto.getImageUrl() != null) {
            store.setImageUrl(storeDto.getImageUrl());
        }
        if (storeDto.getOpentime() != null) {
            store.setOpentime(storeDto.getOpentime());
        }
        if (storeDto.getClosedtime() != null) {
            store.setClosedtime(storeDto.getClosedtime());
        }
        if (storeDto.getManagerEmail() != null) {
            store.setManagerEmail(storeDto.getManagerEmail());
        }

        Store updatedStore = storeRepository.save(store);
        return StoreMapper.mapToStoreDto(updatedStore);
    }

    @Override
    public void deleteStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        storeRepository.delete(store);
    }
}