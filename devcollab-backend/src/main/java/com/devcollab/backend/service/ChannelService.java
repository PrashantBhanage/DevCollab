package com.devcollab.backend.service;

import java.util.List;

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
	public ChannelResponse createChannel(String workspaceId, CreateChannelRequest request) {
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
	public List<ChannelResponse> getChannelsByWorkspace(String workspaceId) {
		workspaceAccessService.requireWorkspaceMember(workspaceId);
		return channelRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId)
			.stream()
			.map(this::toResponse)
			.toList();
	}

	@Transactional
	public void deleteChannel(String channelId) {
		Channel channel = channelRepository.findById(channelId)
			.orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
		workspaceAccessService.requireWorkspaceOwner(channel.getWorkspaceId());
		messageRepository.deleteByChannelId(channelId);
		channelRepository.delete(channel);
	}

	private ChannelResponse toResponse(Channel channel) {
		return new ChannelResponse(
			channel.getId(),
			channel.getName(),
			channel.getWorkspaceId(),
			channel.getCreatedBy(),
			channel.getCreatedAt()
		);
	}
}
