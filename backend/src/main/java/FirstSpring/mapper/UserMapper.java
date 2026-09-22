package FirstSpring.mapper;

import FirstSpring.dto.UserDto;
import FirstSpring.entity.User;

public class UserMapper {

    public static UserDto mapToUserDto(User user) {
        if (user == null) return null;
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole()); // Map entity role to DTO

        return userDto;
    }

    public static User mapToUser(UserDto userDto) {
        if (userDto == null) return null;
        User user = new User();
        user.setId(userDto.getId());
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole()); // Map DTO role to entity
        return user;
    }
}