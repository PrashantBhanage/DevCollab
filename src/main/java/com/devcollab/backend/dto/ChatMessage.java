package com.devcollab.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devcollab.backend.model.Message;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

	private UUID channelId;
	private Long senderId;
	private String senderName;
	private String content;
	private Message.Type type;
	private String language;
	private LocalDateTime timestamp;
}
