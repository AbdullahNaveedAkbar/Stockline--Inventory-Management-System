package FirstSpring.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // <--- Store Name (mapped to 'name' column)

    @Column(name = "store_type")
    private String storeType;

    @Column(name = "open_time")
    private LocalTime opentime;

    @Column(name = "closed_time")
    private LocalTime closedtime;

    @Column(name = "manager_email")
    private String managerEmail;

    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    // Correct relationship mapping to the owner/user using user_id column
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    public Store() {}

    public Store(String name, String storeType, String description, User user) {
        this.name = name;
        this.storeType = storeType;
        this.description = description;
        this.user = user;
    }

    public Store(String name, String storeType, String description, LocalTime opentime, LocalTime closedtime, String managerEmail, User user) {
        this.name = name;
        this.storeType = storeType;
        this.description = description;
        this.opentime = opentime;
        this.closedtime = closedtime;
        this.managerEmail = managerEmail;
        this.user = user;
    }

    public Store(String name, String storeType, String description, String imageUrl, User user) {
        this.name = name;
        this.storeType = storeType;
        this.description = description;
        this.imageUrl = imageUrl;
        this.user = user;
    }

    public String getRecipientEmail() {
        if (managerEmail != null && !managerEmail.isBlank()) {
            return managerEmail;
        }
        return (user != null) ? user.getEmail() : null;
    }

    // Returns owner name to JSON without creating duplicate SQL columns
    public String getOwnerName() {
        return (user != null) ? user.getName() : "N/A";
    }
}


