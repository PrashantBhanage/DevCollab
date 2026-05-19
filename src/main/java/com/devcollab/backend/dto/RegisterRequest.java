package com.devcollab.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

	@NotBlank
	@Size(max = 100)
	private String name;

	@NotBlank
	@Email
	@Size(max = 150)
	private String email;

	@NotBlank
	@Size(min = 6, max = 100)
	private String password;
}
