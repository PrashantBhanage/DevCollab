package com.devcollab.backend.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devcollab.backend.dto.ChannelResponse;
import com.devcollab.backend.dto.CreateChannelRequest;
import com.devcollab.backend.exception.ResourceNotFoundException;
import com.devcollab.backend.model.Channel;
import com.devcollab.backend.model.User;
import com.devcollab.backend.repository.ChannelRepository;
import com.devcollab.backend.repository.MessageRepository;

@Service
public class ChannelService {

	private final ChannelRepository channelRepository;
	private final MessageRepository messageRepository;
	private final WorkspaceAccessService workspaceAccessService;

	public ChannelService(
		ChannelRepository channelRepository,
		MessageRepository messageRepository,
		WorkspaceAccessService workspaceAccessService
	) {
		this.channelRepository = channelRepository;
		this.messageRepository = messageRepository;
		this.workspaceAccessService = workspaceAccessService;
	}

	@Transactional
	@NonNull
	public ChannelResponse createChannel(@NonNull Long workspaceId, @NonNull CreateChannelRequest request) {
		if (request.name() == null || request.name().isBlank()) {
			throw new IllegalArgumentException("Channel name cannot be empty");
		}
		workspaceAccessService.requireWorkspaceMember(workspaceId);
		User currentUser = workspaceAccessService.getCurrentUser();

		Channel channel = Channel.builder()
			.name(request.name().trim())
			.workspaceId(workspaceId)
			.createdBy(currentUser.getId())
			.build();

		return toResponse(channelRepository.save(channel));
	}

	@Transactional(readOnly = true)
	@NonNull
	public List<ChannelResponse> getChannelsByWorkspace(@NonNull Long workspaceId) {
		workspaceAccessService.requireWorkspaceMember(workspaceId);
		return channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId)
			.stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional
	public void deleteChannel(@NonNull Long channelId) {
		Channel channel = channelRepository.findById(channelId)
			.orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
		workspaceAccessService.requireWorkspaceOwner(channel.getWorkspaceId());
		messageRepository.deleteByChannelId(channelId);
		channelRepository.delete(channel);
	}

	@NonNull
	private ChannelResponse toResponse(@NonNull Channel channel) {
		return new ChannelResponse(
			channel.getId(),
			channel.getName(),
			channel.getWorkspaceId(),
			channel.getCreatedBy(),
			channel.getCreatedAt()
		);
	}
}
