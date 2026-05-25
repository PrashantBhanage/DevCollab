package com.devcollab.backend.dto;

import com.devcollab.backend.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
	private Long id;
	private String content;
	private Long channelId;
	private Long senderId;
	private String senderName;
	private Message.Type type;
	private String language;
	private LocalDateTime createdAt;
}
