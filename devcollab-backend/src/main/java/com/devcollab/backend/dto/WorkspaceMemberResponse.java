package com.devcollab.backend.dto;

public record WorkspaceMemberResponse(
	Long id,
	String name,
	String email,
	String role,
	boolean isOnline
) {
}
