package com.smartcampus.backend.security;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Find or create user
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setName(name);
            user.setPicture(picture);
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .role("USER")           // default role
                    .provider("google")
                    .createdAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
        }

        userRepository.save(user);

        // Generate JWT
        String token = jwtUtil.generateToken(email, user.getRole(), name);

        // Redirect to frontend with token and role
        response.sendRedirect(
         frontendUrl
             + "/auth/callback?token=" + token
             + "&role=" + user.getRole()
             + "&name=" + java.net.URLEncoder.encode(name, java.nio.charset.StandardCharsets.UTF_8)
             + "&userId=" + user.getId()
        );
    }
}