package com.devcollab.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.CreateMessageRequest;
import com.devcollab.backend.dto.MessageResponse;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.Channel;
import com.devcollab.backend.model.Message;
import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.ChannelRepository;
import com.devcollab.backend.repository.MessageRepository;
import com.devcollab.backend.repository.UserRepository;

@Service
public class MessageService {

        private final MessageRepository messageRepository;
        private final ChannelRepository channelRepository;
        private final UserRepository userRepository;
        private final WorkspaceAccessService workspaceAccessService;

        public MessageService(
                MessageRepository messageRepository,
                ChannelRepository channelRepository,
                UserRepository userRepository,
                WorkspaceAccessService workspaceAccessService
        ) {
                this.messageRepository = messageRepository;
                this.channelRepository = channelRepository;
                this.userRepository = userRepository;
                this.workspaceAccessService = workspaceAccessService;
        }

        @Transactional
        @NonNull
        public MessageResponse saveMessage(@NonNull Long channelId, @NonNull CreateMessageRequest request) {
                if (request.content() == null || request.content().isBlank()) {
                        throw new IllegalArgumentException("Message content cannot be empty");
                }
                Channel channel = getChannel(channelId);
                workspaceAccessService.requireWorkspaceMember(channel.getWorkspaceId());
                User currentUser = workspaceAccessService.getCurrentUser();

                Message message = Message.builder()
                        .channelId(channelId)
                        .senderId(currentUser.getId())
                        .content(request.content().trim())
                        .type(request.type() == null ? Message.Type.TEXT : request.type())
                        .language(trimToNull(request.language()))
                        .build();

                return toResponse(messageRepository.save(message));
        }

        @Transactional(readOnly = true)
        @NonNull
        public Page<MessageResponse> getMessagesByChannel(@NonNull Long channelId, int page, int size) {
                Channel channel = getChannel(channelId);
                workspaceAccessService.requireWorkspaceMember(channel.getWorkspaceId());
                return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId, PageRequest.of(page, size))
                        .map(this::toResponse);
        }

        @NonNull
        private Channel getChannel(@NonNull Long channelId) {
                return channelRepository.findById(channelId)
                        .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        }

        @NonNull
        private MessageResponse toResponse(@NonNull Message message) {
                String senderName = "Unknown User";
                if (message.getSenderId() != null) {
                        senderName = userRepository.findById(message.getSenderId())
                                .map(User::getName)
                                .orElse("Unknown User");
                }

                return new MessageResponse(
                        message.getId(),
                        message.getContent(),
                        message.getCreatedAt(),
                        message.getChannelId(),
                        message.getSenderId(),
                        senderName,
                        message.getType(),
                        message.getLanguage()
                );
        }

        private String trimToNull(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }
}
