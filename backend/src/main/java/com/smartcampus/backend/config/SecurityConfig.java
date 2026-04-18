package com.smartcampus.backend.config;

import com.smartcampus.backend.security.JwtAuthFilter;
import com.smartcampus.backend.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // OAuth public
                .requestMatchers("/oauth2/**", "/login/**").permitAll()

                // Public resource reads
                .requestMatchers(HttpMethod.GET, "/api/resources").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resources/**").permitAll()

                // Admin resource writes
                .requestMatchers(HttpMethod.POST, "/api/resources").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")

                // ✅ NEW: Availability check — any logged-in user can call this
                // Must be declared BEFORE the admin-only GET /api/bookings rule below
                // so Spring Security matches /availability first and doesn't fall through to hasRole(ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/bookings/availability").authenticated()

                // Booking rules
                .requestMatchers(HttpMethod.GET, "/api/bookings/my").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/reject").hasRole("ADMIN")

                // Module C - Ticket rules (admin only)
                .requestMatchers(HttpMethod.GET, "/api/tickets").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/assign").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/status").hasRole("ADMIN")

                // Module C - Ticket rules (authenticated users)
                .requestMatchers(HttpMethod.POST, "/api/tickets").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tickets/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tickets/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/comments").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/comments/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/*/comments/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/attachments").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\"}");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}