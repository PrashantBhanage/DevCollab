package com.devcollab.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devcollab.backend.dto.CreateMessageRequest;
import com.devcollab.backend.dto.MessageResponse;
import com.devcollab.backend.service.MessageService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Validated
@RestController
@RequestMapping("/api")
public class MessageController {

	private final MessageService messageService;

	public MessageController(MessageService messageService) {
		this.messageService = messageService;
	}

	@PostMapping("/channels/{channelId}/messages")
	public ResponseEntity<MessageResponse> saveMessage(
		@PathVariable UUID channelId,
		@Valid @RequestBody CreateMessageRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(messageService.saveMessage(channelId, request));
	}

	@GetMapping("/channels/{channelId}/messages")
	public ResponseEntity<Page<MessageResponse>> getMessages(
		@PathVariable UUID channelId,
		@RequestParam(defaultValue = "0") @Min(0) int page,
		@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
	) {
		return ResponseEntity.ok(messageService.getMessagesByChannel(channelId, page, size));
	}
}
