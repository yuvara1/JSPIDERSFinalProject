package com.food.controller;

import com.food.dto.request.LoginRequest;
import com.food.dto.request.RegisterRequest;
import com.food.dto.response.ApiResponse;
import com.food.dto.response.JwtResponse;
import com.food.dto.response.MessageResponse;
import com.food.entity.User;
import com.food.exception.DuplicateResourceException;
import com.food.repository.UserRepository;
import com.food.security.jwt.JwtUtils;
import com.food.security.service.TokenBlackListService;
import com.food.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    @Autowired
    private TokenBlackListService tokenBlackListService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<MessageResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register attempt for username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username already taken - {}", request.getUsername());
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already in use - {}", request.getEmail());
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", request.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("User registered successfully!"),
                "Registration successful"
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and generate JWT token")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        log.info("User logged in successfully: {}", request.getUsername());

        JwtResponse jwtResponse = JwtResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .build();

        return ResponseEntity.ok(ApiResponse.success(jwtResponse, "Login successful"));
    }


    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Clear user session")
    public ResponseEntity<ApiResponse<MessageResponse>> logout(HttpServletRequest request) {
        log.info("User logging out");
        SecurityContextHolder.clearContext();
        log.info(" request {}", request.getRequestURI(), request.getHeaders("Authorization"));
        String token = jwtUtils.parseJwt(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(
                    "No token provided for logout",
                    "Logout failed"
            ));
        }
        log.info("Extracted token for logout: {}", token);
        if (token != null && jwtUtils.validateJwtToken(token)) {
            long expiry = jwtUtils.getExpirationDateFromToken(token).getTime();
            tokenBlackListService.blackListToken(token, expiry);
            log.info("Token blacklisted successfully");
        }
        log.info("User logged out successfully");

        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("Logged out successfully."),
                "Logout successful"
        ));
    }
}
