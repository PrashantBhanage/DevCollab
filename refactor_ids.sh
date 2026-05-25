#!/bin/bash
find devcollab-backend/src/main/java -name "*.java" -type f -exec sed -i \
  -e 's/private String id;/private Long id;/g' \
  -e 's/private String workspaceId;/private Long workspaceId;/g' \
  -e 's/private String userId;/private Long userId;/g' \
  -e 's/private String senderId;/private Long senderId;/g' \
  -e 's/private String channelId;/private Long channelId;/g' \
  -e 's/private String assignedTo;/private Long assignedTo;/g' \
  -e 's/private String createdBy;/private Long createdBy;/g' \
  -e 's/private String ownerId;/private Long ownerId;/g' \
  -e 's/private String conversationId;/private Long conversationId;/g' \
  -e 's/String workspaceId,/Long workspaceId,/g' \
  -e 's/String workspaceId)/Long workspaceId)/g' \
  -e 's/String userId)/Long userId)/g' \
  -e 's/String userId,/Long userId,/g' \
  -e 's/String conversationId/Long conversationId/g' \
  -e 's/String channelId/Long channelId/g' \
  -e 's/String id)/Long id)/g' \
  -e 's/String id,/Long id,/g' \
  -e 's/ResponseEntity<List<AiMessageResponse>> getMessages(@PathVariable UUID id)/ResponseEntity<List<AiMessageResponse>> getMessages(@PathVariable Long id)/g' \
  -e 's/ResponseEntity<AiMessageResponse> sendMessage(\n\t\t@PathVariable UUID id/ResponseEntity<AiMessageResponse> sendMessage(\n\t\t@PathVariable Long id/g' \
  -e 's/@PathVariable UUID id/@PathVariable Long id/g' \
  -e 's/@GeneratedValue(strategy = GenerationType.UUID)/@GeneratedValue(strategy = GenerationType.IDENTITY)/g' \
  -e 's/private String name;/private String username;/g' \
  -e 's/public String getName()/public String getUsername()/g' \
  -e 's/public void setName(String/public void setUsername(String/g' \
  {} +
