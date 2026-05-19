package com.devcollab.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devcollab.backend.dto.ChannelResponse;
import com.devcollab.backend.dto.CreateChannelRequest;
import com.devcollab.backend.service.ChannelService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api")
public class ChannelController {

	private final ChannelService channelService;

	public ChannelController(ChannelService channelService) {
		this.channelService = channelService;
	}

	@PostMapping("/workspaces/{id}/channels")
	public ResponseEntity<ChannelResponse> createChannel(
		@PathVariable Long id,
		@Valid @RequestBody CreateChannelRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(channelService.createChannel(id, request));
	}

	@GetMapping("/workspaces/{id}/channels")
	public ResponseEntity<List<ChannelResponse>> getChannels(@PathVariable Long id) {
		return ResponseEntity.ok(channelService.getChannelsByWorkspace(id));
	}

	@DeleteMapping("/channels/{channelId}")
	public ResponseEntity<Void> deleteChannel(@PathVariable UUID channelId) {
		channelService.deleteChannel(channelId);
		return ResponseEntity.noContent().build();
	}
}
