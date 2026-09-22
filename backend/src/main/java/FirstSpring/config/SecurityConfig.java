package FirstSpring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // Disabled for REST APIs
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 1. Public Endpoints
                        .requestMatchers("/api/users/login", "/api/users/register").permitAll()

                        // 2. Stores Management (Admin Only)
                        .requestMatchers("/stores/**", "/api/stores/**").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")

                        // 3. Analytics (Admin Only)
                        .requestMatchers("/analytics/**", "/api/analytics/**").hasRole("ADMIN")

                        // 4. Categories & Products Management (Admin and Manager)
                        .requestMatchers(HttpMethod.GET, "/products/**", "/api/products/**", "/categories/**", "/api/categories/**")
                        .hasAnyRole("ADMIN", "MANAGER", "CUSTOMER") // Everyone logged in can view products/categories
                        .requestMatchers("/products/**", "/api/products/**", "/categories/**", "/api/categories/**")
                        .hasAnyRole("ADMIN", "MANAGER") // Create, Update, Delete restricted to Admin & Manager

                        // 5. Orders Processing
                        .requestMatchers(HttpMethod.POST, "/orders/**", "/api/orders/**").hasRole("CUSTOMER") // Customers place orders
                        .requestMatchers("/orders/**", "/api/orders/**").hasAnyRole("ADMIN", "MANAGER") // Admin & Manager manage order status/sales

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}