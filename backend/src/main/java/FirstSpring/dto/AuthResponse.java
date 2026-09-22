package FirstSpring.dto;

import FirstSpring.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {
    private  Long userId;
    private String token;
    private String name;
    private String role ;

    public AuthResponse(String token, Long userId, String name, String role) {

        this.token = token;
        this.userId= userId;
        this.name=name;
        this.role = role ;
    }

}
