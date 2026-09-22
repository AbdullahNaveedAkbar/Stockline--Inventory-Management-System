package FirstSpring.mapper;

import FirstSpring.dto.CategoryDto;
import FirstSpring.dto.ProductDto;
import FirstSpring.entity.Category;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryDto mapToCategoryDto(Category category) {
        if (category == null) return null;

        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());

        if (category.getStore() != null) {
            dto.setStoreId(category.getStore().getId());
        }

        if (category.getProducts() != null) {
            List<ProductDto> productDtos = category.getProducts().stream()
                    .map(ProductMapper::mapToProductDto)
                    .collect(Collectors.toList());
            dto.setProducts(productDtos);
        } else {
            dto.setProducts(Collections.emptyList());
        }

        return dto;
    }
}