package com.devcollab.backend.controller;

import java.util.List;
import java.util.UUID;

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

import com.devcollab.backend.dto.AiConversationResponse;
import com.devcollab.backend.dto.AiMessageResponse;
import com.devcollab.backend.dto.CreateAiConversationRequest;
import com.devcollab.backend.dto.SendAiMessageRequest;
import com.devcollab.backend.service.AiService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/ai")
public class AiController {

	private final AiService aiService;

	public AiController(AiService aiService) {
		this.aiService = aiService;
	}

	@PostMapping("/conversations")
	public ResponseEntity<AiConversationResponse> createConversation(
		@Valid @RequestBody CreateAiConversationRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED).body(aiService.createConversation(request));
	}

	@PostMapping("/conversations/{id}/messages")
	public ResponseEntity<AiMessageResponse> sendMessage(
		@PathVariable UUID id,
		@Valid @RequestBody SendAiMessageRequest request
	) {
		return ResponseEntity.ok(aiService.sendMessage(id, request));
	}

	@GetMapping("/conversations/{id}/messages")
	public ResponseEntity<List<AiMessageResponse>> getMessages(@PathVariable UUID id) {
		return ResponseEntity.ok(aiService.getMessages(id));
	}

	@GetMapping("/conversations")
	public ResponseEntity<List<AiConversationResponse>> getConversations(
		@RequestParam(required = false) Long workspaceId
	) {
		return ResponseEntity.ok(aiService.getConversations(workspaceId));
	}
}
