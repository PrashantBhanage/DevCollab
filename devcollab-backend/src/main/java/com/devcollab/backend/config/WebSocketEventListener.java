package com.devcollab.backend.config;

import java.util.Set;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.devcollab.backend.service.OnlineStatusService;

@Component
public class WebSocketEventListener {

	private final OnlineStatusService onlineStatusService;
	private final SimpMessagingTemplate simpMessagingTemplate;

	public WebSocketEventListener(
		OnlineStatusService onlineStatusService,
		SimpMessagingTemplate simpMessagingTemplate
	) {
		this.onlineStatusService = onlineStatusService;
		this.simpMessagingTemplate = simpMessagingTemplate;
	}

	@EventListener
	public void handleSessionConnect(SessionConnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
		java.util.Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
		if (sessionAttributes == null) {
			return;
		}

		Object userIdValue = sessionAttributes.get("userId");
		if (!(userIdValue instanceof Long userId)) {
			return;
		}

		onlineStatusService.setUserOnline(userId, accessor.getSessionId());
		simpMessagingTemplate.convertAndSend(
			"/topic/online-status",
			new OnlineStatusUpdate(userId, true, onlineStatusService.getAllOnlineUsers())
		);
	}

	@EventListener
	public void handleSessionDisconnect(SessionDisconnectEvent event) {
		Long userId = onlineStatusService.setUserOffline(event.getSessionId());
		if (userId == null) {
			return;
		}

		simpMessagingTemplate.convertAndSend(
			"/topic/online-status",
			new OnlineStatusUpdate(userId, false, onlineStatusService.getAllOnlineUsers())
		);
	}

	private record OnlineStatusUpdate(Long userId, boolean online, Set<Long> onlineUsers) {
	}
}
