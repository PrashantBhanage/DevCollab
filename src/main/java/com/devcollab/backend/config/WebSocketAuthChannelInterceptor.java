package com.devcollab.backend.config;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.security.JwtUtil;
import com.devcollab.backend.security.UserDetailsServiceImpl;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

	private final JwtUtil jwtUtil;
	private final UserDetailsServiceImpl userDetailsService;
	private final UserRepository userRepository;

	public WebSocketAuthChannelInterceptor(
		JwtUtil jwtUtil,
		UserDetailsServiceImpl userDetailsService,
		UserRepository userRepository
	) {
		this.jwtUtil = jwtUtil;
		this.userDetailsService = userDetailsService;
		this.userRepository = userRepository;
	}

	@Override
	public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
		if (accessor == null) {
			return message;
		}

		if (StompCommand.CONNECT.equals(accessor.getCommand())) {
			Authentication authentication = authenticate(accessor);
			accessor.setUser(authentication);
			User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
			accessor.getSessionAttributes().put("userId", user.getId());
			accessor.getSessionAttributes().put("username", user.getEmail());
		}
		else if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
			Object username = accessor.getSessionAttributes().get("username");
			if (username instanceof String savedUsername && !savedUsername.isBlank()) {
				UserDetails userDetails = userDetailsService.loadUserByUsername(savedUsername);
				accessor.setUser(new UsernamePasswordAuthenticationToken(
					userDetails.getUsername(),
					null,
					userDetails.getAuthorities()
				));
			}
		}

		return message;
	}

	private Authentication authenticate(StompHeaderAccessor accessor) {
		String authorizationHeader = firstNonBlank(
			accessor.getFirstNativeHeader("Authorization"),
			accessor.getFirstNativeHeader("authorization")
		);
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("Missing WebSocket authorization token");
		}

		String token = authorizationHeader.substring(7);
		String username = jwtUtil.extractUsername(token);
		UserDetails userDetails = userDetailsService.loadUserByUsername(username);
		if (!jwtUtil.validateToken(token, userDetails)) {
			throw new IllegalArgumentException("Invalid WebSocket authorization token");
		}

		return new UsernamePasswordAuthenticationToken(
			userDetails.getUsername(),
			null,
			userDetails.getAuthorities()
		);
	}

	private String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value;
			}
		}
		return null;
	}
}
