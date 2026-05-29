package com.devcollab.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinWorkspaceRequest(
	@NotBlank(message = "Invite code is required")
	String inviteCode) {
}
