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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

        String provider = request.getRequestURI().contains("github") ? "github" : "google";

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if ("github".equals(provider)) {
            String login = oAuth2User.getAttribute("login");
            String avatarUrl = oAuth2User.getAttribute("avatar_url");

            if (email == null || email.isBlank()) {
                email = login + "@github.local";
            }

            if (name == null || name.isBlank()) {
                name = login;
            }

            if (picture == null || picture.isBlank()) {
                picture = avatarUrl;
            }
        }

        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?error=email_missing");
            return;
        }

        if (name == null || name.isBlank()) {
            name = email;
        }

        if (picture == null) {
            picture = "";
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setName(name);
            user.setPicture(picture);
            user.setProvider(provider);
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .role("USER")
                    .provider(provider)
                    .createdAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
        }

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(email, user.getRole(), name);

        String safeFrontendUrl = frontendUrl != null ? frontendUrl : "";
        String safeToken = token != null ? token : "";
        String safeRole = user.getRole() != null ? user.getRole() : "USER";
        String safeName = name != null ? name : "";
        String safeUserId = user.getId() != null ? String.valueOf(user.getId()) : "";

        response.sendRedirect(
                safeFrontendUrl
                        + "/auth/callback?token=" + URLEncoder.encode(safeToken, StandardCharsets.UTF_8)
                        + "&role=" + URLEncoder.encode(safeRole, StandardCharsets.UTF_8)
                        + "&name=" + URLEncoder.encode(safeName, StandardCharsets.UTF_8)
                        + "&userId=" + URLEncoder.encode(safeUserId, StandardCharsets.UTF_8)
        );
    }
}