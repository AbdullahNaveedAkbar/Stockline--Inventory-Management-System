package FirstSpring.config;

import FirstSpring.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "YourSuperSecretKeyForJWTTokenGenerationStoreProject2026!";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours in milliseconds

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // 1. Generate Token with Role Included
    public String generateToken(String email, Role role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role.name()) // Adds "ROLE_ADMIN", "ROLE_MANAGER", or "ROLE_CUSTOMER"
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Overloaded method to keep backward compatibility if needed temporarily
    public String generateToken(String email) {
        return generateToken(email, Role.ROLE_CUSTOMER);
    }

    // 2. Extract Role from Token
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // Extract Email from Token
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Delegate extractUsername to extractEmail
    public String extractUsername(String jwt) {
        return extractEmail(jwt);
    }

    // Validate Token
    public boolean validateToken(String token, String email) {
        String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}