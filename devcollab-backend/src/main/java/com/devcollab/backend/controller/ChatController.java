package com.devcollab.backend.controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Supplier;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

import com.devcollab.backend.dto.ChatMessage;
import com.devcollab.backend.dto.CreateMessageRequest;
import com.devcollab.backend.dto.MessageResponse;
import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.UserRepository;
import com.devcollab.backend.service.MessageService;

@Controller
public class ChatController {

        private final MessageService messageService;
        private final UserRepository userRepository;
        private final SimpMessagingTemplate simpMessagingTemplate;

        public ChatController(
                MessageService messageService,
                UserRepository userRepository,
                SimpMessagingTemplate simpMessagingTemplate
        ) {
                this.messageService = messageService;
                this.userRepository = userRepository;
                this.simpMessagingTemplate = simpMessagingTemplate;
        }

        @MessageMapping("/channel/{channelId}/send")
        public void sendMessage(
                @DestinationVariable Long channelId,
                @Payload ChatMessage payload,
                Principal principal
        ) {
                User user = resolveUser(principal, payload);
                MessageResponse savedMessage = runAsUser(
                        user,
                        () -> messageService.saveMessage(
                                channelId,
                                new CreateMessageRequest(payload.getContent(), payload.getType(), payload.getLanguage())
                        )
                );

                ChatMessage response = ChatMessage.builder()
                        .id(savedMessage.id())
                        .channelId(channelId)
                        .senderId(savedMessage.senderId())
                        .senderName(user.getName())
                        .content(savedMessage.content())
                        .type(savedMessage.type())
                        .language(savedMessage.language())
                        .createdAt(savedMessage.createdAt())
                        .build();

                simpMessagingTemplate.convertAndSend("/topic/channel/" + channelId, response);
        }

        @MessageMapping("/channel/{channelId}/typing")
        public void typing(
                @DestinationVariable Long channelId,
                @Payload ChatMessage payload,
                Principal principal
        ) {
                User user = resolveUser(principal, payload);

                ChatMessage response = ChatMessage.builder()
                        .channelId(channelId)
                        .senderId(user.getId())
                        .senderName(user.getName())
                        .content(payload.getContent())
                        .type(payload.getType())
                        .language(payload.getLanguage())
                        .createdAt(payload.getCreatedAt() == null ? LocalDateTime.now() : payload.getCreatedAt())
                        .build();

                simpMessagingTemplate.convertAndSend("/topic/channel/" + channelId + "/typing", response);
        }

        private User resolveUser(Principal principal, ChatMessage payload) {
                if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
                        return userRepository.findByEmail(principal.getName())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                }

                if (payload.getSenderId() != null) {
                        return userRepository.findById(payload.getSenderId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                }

                throw new IllegalArgumentException("Unable to resolve chat user");
        }

        private <T> T runAsUser(User user, Supplier<T> action) {
                SecurityContext previousContext = SecurityContextHolder.getContext();
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of()));
                SecurityContextHolder.setContext(context);

                try {
                        return action.get();
                }
                finally {
                        SecurityContextHolder.clearContext();
                        if (previousContext != null && previousContext.getAuthentication() != null) {
                                SecurityContextHolder.setContext(previousContext);
                        }
                }
        }
}
