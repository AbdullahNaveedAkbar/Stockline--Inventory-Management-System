package FirstSpring.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

@Setter
@Getter
public class StoreDto {
    // Getters and Setters
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerName;
    private List<CategoryDto> categories;
    private String storeType;
    private LocalTime opentime;
    private LocalTime closedtime;
    private String managerEmail;
    private String imageUrl;

    public StoreDto() {
    }




    public boolean isOpenNow() {
        if (opentime == null || closedtime == null) {
            return false;
        }
        LocalTime now = LocalTime.now(); // Uses server local time

        // Normal hours (e.g., 09:00 to 21:00)
        if (opentime.isBefore(closedtime)) {
            return !now.isBefore(opentime) && now.isBefore(closedtime);
        }
        // Overnight hours (e.g., 20:00 to 02:00)
        else {
            return !now.isBefore(opentime) || now.isBefore(closedtime);
        }
    }

}