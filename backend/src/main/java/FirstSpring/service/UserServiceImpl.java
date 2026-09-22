package FirstSpring.service;

import FirstSpring.config.JwtUtil;
import FirstSpring.dto.RegisterRequestDto;
import FirstSpring.dto.UserDto;
import FirstSpring.dto.UserUpdateRequestDto;
import FirstSpring.entity.Role;
import FirstSpring.entity.User;
import FirstSpring.exception.ResourceNotFoundException;
import FirstSpring.mapper.UserMapper;
import FirstSpring.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static FirstSpring.mapper.UserMapper.mapToUserDto;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserMapper::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserDto(user);
    }

    @Override
    public UserDto createUser(RegisterRequestDto registerDto) {
        if (registerDto.getEmail() == null || registerDto.getEmail().isEmpty()) {
            throw new ResourceNotFoundException("User email cannot be empty.");
        }

        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        // Assign specified role if provided in DTO; default to ROLE_CUSTOMER
        if (registerDto.getRole() != null) {
            user.setRole(registerDto.getRole());
        } else {
            user.setRole(Role.ROLE_CUSTOMER);
        }

        User savedUser = userRepository.save(user);
        return mapToUserDto(savedUser);
    }

    @Override
    public UserDto updateUser(Long id, UserUpdateRequestDto updateDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        existingUser.setName(updateDto.getName());
        existingUser.setEmail(updateDto.getEmail());

        if (updateDto.getPassword() != null && !updateDto.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }

        // Allow updating user role if specified in update DTO
        if (updateDto.getRole() != null) {
            existingUser.setRole(updateDto.getRole());
        }

        User updatedUser = userRepository.save(existingUser);
        return mapToUserDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(existingUser);
    }

    @Override
    public String loginUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && passwordEncoder.matches(rawPassword, user.getPassword())) {
            // Pass both email and user's role to generate JWT with authorities embedded
            return jwtUtil.generateToken(email, user.getRole());
        }
        return null;
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return mapToUserDto(user);
    }
}