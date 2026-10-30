package com.freshmart.grocery.service;

import com.freshmart.grocery.dto.AuthRequest;
import com.freshmart.grocery.dto.AuthResponse;
import com.freshmart.grocery.dto.RegisterRequest;
import com.freshmart.grocery.model.Address;
import com.freshmart.grocery.model.User;
import com.freshmart.grocery.repository.UserRepository;
import com.freshmart.grocery.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Public signup must never grant administrative privileges.
        // Provision admins separately through a trusted database/bootstrap process.
        String role = "ROLE_CUSTOMER";

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setPhone(req.getPhone());

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(), user.getAddresses());
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(), user.getAddresses());
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase());
    }

    public User addAddress(String userId, Address address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (address.getId() == null || address.getId().isEmpty()) {
            address.setId("addr_" + System.currentTimeMillis());
        }

        if (user.getAddresses().isEmpty() || address.isDefault()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
            address.setDefault(true);
        }

        user.getAddresses().add(address);
        return userRepository.save(user);
    }

    public List<Address> getAddresses(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getAddresses();
    }
}
