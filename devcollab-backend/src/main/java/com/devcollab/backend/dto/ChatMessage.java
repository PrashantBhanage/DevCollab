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
	private String id;
	private String content;
	private String channelId;
	private String senderId;
	private String senderName;
	private Message.Type type;
	private String language;
	private LocalDateTime createdAt;
}
