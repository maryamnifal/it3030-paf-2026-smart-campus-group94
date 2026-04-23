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

        // ✅ Detect provider first
        String provider = request.getRequestURI().contains("github") ? "github" : "google";

        // ✅ Get email — GitHub sometimes returns null email
        String email = oAuth2User.getAttribute("email");

        // ✅ GitHub fallback — use login as email if email is null
        if (email == null || email.isBlank()) {
            String login = oAuth2User.getAttribute("login"); // GitHub username
            if (login != null) {
                email = login + "@github.com"; // create fake email from username
            }
        }

        // ✅ Get name — GitHub sometimes returns null name
        String name = oAuth2User.getAttribute("name");
        if (name == null || name.isBlank()) {
            // Try GitHub login (username) as fallback
            name = oAuth2User.getAttribute("login");
        }
        if (name == null || name.isBlank()) {
            name = email; // last resort
        }

        // ✅ Get picture
        String picture = oAuth2User.getAttribute("picture");
        // GitHub uses avatar_url instead of picture
        if (picture == null || picture.isBlank()) {
            picture = oAuth2User.getAttribute("avatar_url");
        }
        if (picture == null) {
            picture = "";
        }

        // ✅ Safety check — if email still null something is very wrong
        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?error=email_not_found");
            return;
        }

        // ✅ Save or update user
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

        userRepository.save(user);

        // ✅ Generate JWT
        String token = jwtUtil.generateToken(email, user.getRole(), name);

        // ✅ Redirect to frontend
        response.sendRedirect(
                frontendUrl
                        + "/auth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                        + "&role=" + URLEncoder.encode(user.getRole(), StandardCharsets.UTF_8)
                        + "&name=" + URLEncoder.encode(name, StandardCharsets.UTF_8)
                        + "&userId=" + URLEncoder.encode(user.getId(), StandardCharsets.UTF_8)
        );
    }
}