#!/bin/bash
TOKEN=`curl -s -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name": "Test User", "email": "ai@example.com", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4`

if [ -z "$TOKEN" ]; then
    TOKEN=`curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "ai@example.com", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4`
fi

WS_ID=`curl -s -X POST http://localhost:8080/api/workspaces \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"name": "AI Workspace"}' | grep -o '"id":[^,]*' | cut -d':' -f2 | tr -d ' }'`

echo "Workspace ID: $WS_ID"

curl -v -X POST http://localhost:8080/api/ai/conversations \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d "{\"workspaceId\": $WS_ID}"