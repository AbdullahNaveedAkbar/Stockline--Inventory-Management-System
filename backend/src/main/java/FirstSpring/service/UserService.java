package FirstSpring.service;

import FirstSpring.dto.RegisterRequestDto;
import FirstSpring.dto.UserDto;
import FirstSpring.dto.UserUpdateRequestDto;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();

    UserDto getUserById(Long id);

    UserDto createUser(RegisterRequestDto registerDto);

    UserDto updateUser(Long id, UserUpdateRequestDto updateDto);

    void deleteUser(Long id);

    String loginUser(String email, String password);

    UserDto getUserByEmail(String email);
}