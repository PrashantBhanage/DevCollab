package com.devcollab.backend.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class OnlineStatusService {

	private final ConcurrentHashMap<Long, Integer> onlineUsers = new ConcurrentHashMap<>();
	private final ConcurrentHashMap<String, Long> sessionUsers = new ConcurrentHashMap<>();

	public void setUserOnline(Long userId, String sessionId) {
		if (userId == null || sessionId == null || sessionId.isBlank()) {
			return;
		}

		sessionUsers.put(sessionId, userId);
		onlineUsers.merge(userId, 1, Integer::sum);
	}

	public Long setUserOffline(String sessionId) {
		if (sessionId == null || sessionId.isBlank()) {
			return null;
		}

		Long userId = sessionUsers.remove(sessionId);
		if (userId == null) {
			return null;
		}

		onlineUsers.computeIfPresent(userId, (key, count) -> count > 1 ? count - 1 : null);
		return userId;
	}

	public Set<Long> getAllOnlineUsers() {
		return Set.copyOf(onlineUsers.keySet());
	}
}
