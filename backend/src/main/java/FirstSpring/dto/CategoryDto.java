package FirstSpring.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class CategoryDto {
    // Getters and Setters
    private Long id;
    private String name;
    private Long storeId;
    private List<ProductDto> products;

    public CategoryDto() {}

}