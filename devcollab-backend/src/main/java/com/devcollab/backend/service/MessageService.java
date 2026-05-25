package com.devcollab.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
        public MessageResponse saveMessage(Long channelId, CreateMessageRequest request) {
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
        public Page<MessageResponse> getMessagesByChannel(Long channelId, int page, int size) {
                Channel channel = getChannel(channelId);
                workspaceAccessService.requireWorkspaceMember(channel.getWorkspaceId());
                return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId, PageRequest.of(page, size))
                        .map(this::toResponse);
        }

        private Channel getChannel(Long channelId) {
                return channelRepository.findById(channelId)
                        .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        }

        private MessageResponse toResponse(Message message) {
                String senderName = userRepository.findById(message.getSenderId())
                        .map(User::getName)
                        .orElse("Unknown User");

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
