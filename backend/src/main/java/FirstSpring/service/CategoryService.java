package FirstSpring.service;

import FirstSpring.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(Long storeId, CategoryDto categoryDto);
    CategoryDto getCategoryById(Long id);
    List<CategoryDto> getCategoriesByStore(Long storeId);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
}