package com.devcollab.backend.service;

import java.util.UUID;

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

@Service
public class MessageService {

	private final MessageRepository messageRepository;
	private final ChannelRepository channelRepository;
	private final WorkspaceAccessService workspaceAccessService;

	public MessageService(
		MessageRepository messageRepository,
		ChannelRepository channelRepository,
		WorkspaceAccessService workspaceAccessService
	) {
		this.messageRepository = messageRepository;
		this.channelRepository = channelRepository;
		this.workspaceAccessService = workspaceAccessService;
	}

	@Transactional
	public MessageResponse saveMessage(UUID channelId, CreateMessageRequest request) {
		Channel channel = getChannel(channelId);
		workspaceAccessService.requireWorkspaceMember(channel.getWorkspaceId());
		User currentUser = workspaceAccessService.getCurrentUser();

		Message message = new Message();
		message.setChannelId(channelId);
		message.setSenderId(currentUser.getId());
		message.setContent(request.content().trim());
		message.setType(request.type() == null ? Message.Type.TEXT : request.type());
		message.setLanguage(trimToNull(request.language()));

		return toResponse(messageRepository.save(message));
	}

	@Transactional(readOnly = true)
	public Page<MessageResponse> getMessagesByChannel(UUID channelId, int page, int size) {
		Channel channel = getChannel(channelId);
		workspaceAccessService.requireWorkspaceMember(channel.getWorkspaceId());
		return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId, PageRequest.of(page, size))
			.map(this::toResponse);
	}

	private Channel getChannel(UUID channelId) {
		return channelRepository.findById(channelId)
			.orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
	}

	private MessageResponse toResponse(Message message) {
		return new MessageResponse(
			message.getId(),
			message.getContent(),
			message.getType(),
			message.getLanguage(),
			message.getChannelId(),
			message.getSenderId(),
			message.getCreatedAt()
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
