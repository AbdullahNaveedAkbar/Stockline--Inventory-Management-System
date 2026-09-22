package FirstSpring.mapper;

import FirstSpring.dto.ProductDto;
import FirstSpring.entity.Product;

public class ProductMapper {

    public static ProductDto mapToProductDto(Product product) {
        if (product == null) return null;

        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());   
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsLowStock(product.isLowStock());

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        return dto;
    }
}