package FirstSpring.mapper;

import FirstSpring.dto.CategoryDto;
import FirstSpring.dto.StoreDto;
import FirstSpring.entity.Store;
import org.hibernate.Hibernate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class StoreMapper {

    public static StoreDto mapToStoreDto(Store store) {
        if (store == null) {
            return null;
        }

        StoreDto dto = new StoreDto();
        dto.setId(store.getId());
        dto.setName(store.getName());
        dto.setStoreType(store.getStoreType());
        dto.setDescription(store.getDescription());
        dto.setImageUrl(store.getImageUrl());
        dto.setOpentime(store.getOpentime());
        dto.setClosedtime(store.getClosedtime());
        dto.setManagerEmail(store.getManagerEmail());


        // Map Owner details safely
        if (store.getUser() != null) {
            dto.setOwnerId(store.getUser().getId());

            // Verify if your User entity uses getName(), getFirstName(), or getEmail()
            dto.setOwnerName(store.getUser().getName());
        }

        // Safely map Categories while avoiding LazyInitializationException
        if (store.getCategories() != null && Hibernate.isInitialized(store.getCategories())) {
            List<CategoryDto> categoryDtos = store.getCategories().stream()
                    .map(CategoryMapper::mapToCategoryDto)
                    .collect(Collectors.toList());
            dto.setCategories(categoryDtos);
        } else {
            dto.setCategories(Collections.emptyList());
        }

        return dto;
    }
}