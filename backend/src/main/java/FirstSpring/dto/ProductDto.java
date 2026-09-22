package FirstSpring.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class ProductDto {
    // Getters and Setters
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private Boolean isLowStock;
    private Long categoryId;
    private String categoryName;

    public ProductDto() {}

}