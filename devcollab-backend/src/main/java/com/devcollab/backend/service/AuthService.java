package com.devcollab.backend.service;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.devcollab.backend.dto.AuthResponse;
import com.devcollab.backend.dto.LoginRequest;
import com.devcollab.backend.dto.RegisterRequest;
import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.security.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;
        private final AuthenticationManager authenticationManager;
        private final WorkspaceAccessService workspaceAccessService;

        public AuthService(
                UserRepository userRepository,
                PasswordEncoder passwordEncoder,
                JwtUtil jwtUtil,
                AuthenticationManager authenticationManager,
                WorkspaceAccessService workspaceAccessService
        ) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.authenticationManager = authenticationManager;
                this.workspaceAccessService = workspaceAccessService;
        }

        @NonNull
        public AuthResponse register(@NonNull RegisterRequest request) {
                if (request.getEmail() == null || request.getName() == null || request.getPassword() == null) {
                        throw new IllegalArgumentException("Registration fields cannot be null");
                }
                String email = request.getEmail().trim().toLowerCase();
                if (userRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email is already registered");
                }

                User user = User.builder()
                        .name(request.getName().trim())
                        .email(email)
                        .password(passwordEncoder.encode(request.getPassword()))
                        .build();

                User savedUser = userRepository.save(user);
                String token = jwtUtil.generateToken(savedUser.getEmail());
                return buildResponse(savedUser, token);
        }

        @NonNull
        public AuthResponse getCurrentUser() {
                User user = workspaceAccessService.getCurrentUser();
                return buildResponse(user, null);
        }

        @NonNull
        public AuthResponse login(@NonNull LoginRequest request) {
                if (request.getEmail() == null || request.getPassword() == null) {
                        throw new IllegalArgumentException("Login fields cannot be null");
                }
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
                );

                User user = userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

                String token = jwtUtil.generateToken(user.getEmail());
                return buildResponse(user, token);
        }

        @NonNull
        private AuthResponse buildResponse(@NonNull User user, String token) {
                return new AuthResponse(token, token != null ? "Bearer" : null, user.getId(), user.getName(), user.getEmail());
        }
}
