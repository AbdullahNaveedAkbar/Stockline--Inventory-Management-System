package FirstSpring.controller;

import FirstSpring.dto.AuthResponse;
import FirstSpring.dto.LoginRequestDto;
import FirstSpring.dto.RegisterRequestDto;
import FirstSpring.dto.UserDto;
import FirstSpring.dto.UserUpdateRequestDto;
import FirstSpring.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Public endpoint for user signup
    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody RegisterRequestDto registerDto) {
        UserDto createdUser = userService.createUser(registerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // Admin endpoint for creating users directly   1
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@RequestBody RegisterRequestDto registerDto) {
        UserDto createdUser = userService.createUser(registerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDto loginDto) {
        String token = userService.loginUser(loginDto.getEmail(), loginDto.getPassword());

        if (token != null) {
            UserDto user = userService.getUserByEmail(loginDto.getEmail());

            // Pass token, userId, name, and role back to the client
            return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getRole() != null ? user.getRole().name() : null
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    // Restrict fetching all users to Admin only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    // Restrict getting user details to Admin or Manager
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public UserDto getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Restrict updating user profiles/roles to Admin
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateUser(@PathVariable Long id, @RequestBody UserUpdateRequestDto updateDto) {
        return userService.updateUser(id, updateDto);
    }

    // Restrict user deletion to Admin
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }
}