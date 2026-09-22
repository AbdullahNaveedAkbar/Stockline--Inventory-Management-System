package FirstSpring.service;

import FirstSpring.dto.ProductDto;
import java.util.List;

public interface ProductService {
    ProductDto createProduct(Long categoryId, ProductDto productDto);
    ProductDto getProductById(Long id);
    List<ProductDto> getProductsByCategory(Long categoryId);
    List<ProductDto> getProductsByStore(Long storeId);
    List<ProductDto> getLowStockProducts(Integer threshold);
    List<ProductDto> getLowStockProductsByStore(Long storeId, Integer threshold);
    ProductDto updateProduct(Long id, ProductDto productDto);
    ProductDto updateStock(Long id, Integer newStock);
    void deleteProduct(Long id);
}