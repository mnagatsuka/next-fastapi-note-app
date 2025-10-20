# WebSocket Integration

## Overview

This API includes real-time WebSocket functionality for comment notifications and updates. The WebSocket system uses a hybrid architecture where data operations are performed via REST endpoints, and real-time notifications are delivered via WebSocket connections.

## WebSocket Connection

### Connection Endpoint
- **Development**: `ws://localhost:3001`
- **Production**: `wss://api-gateway-id.execute-api.ap-northeast-1.amazonaws.com/production`

### Connection Flow
1. Client establishes WebSocket connection to the endpoint
2. Backend automatically handles connection registration
3. Client receives real-time notifications for comment events
4. Connection cleanup happens automatically on disconnect

## Message Types

### 1. Comment Created (`comment.created`)
Sent when a new comment is posted on any note.

```json
{
  "type": "comment.created",
  "data": {
    "postId": "550e8400-e29b-41d4-a716-446655440000",
    "comment": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "content": "This is a new comment!",
      "username": "user@example.com",
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z",
      "postId": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### 2. Comments List (`comments.list`)
Sent when the complete comments list for a note is updated.

```json
{
  "type": "comments.list",
  "data": {
    "postId": "550e8400-e29b-41d4-a716-446655440000",
    "comments": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "content": "First comment",
        "username": "user1@example.com",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "postId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "count": 1
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### 3. Test Messages (`test`)
Used for connection testing and debugging.

```json
{
  "type": "test",
  "data": {
    "message": "Test message content"
  },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Integration with REST Endpoints

### Comment Creation Flow
1. Client posts comment via REST API (`POST /notes/{id}/comments` or `POST /me/notes/{id}/comments`)
2. Backend processes the comment and saves to database
3. Backend automatically broadcasts `comment.created` message to all connected WebSocket clients
4. All clients receive the new comment in real-time

### Authentication
- WebSocket connections do not require authentication to receive messages
- Only authenticated users can post comments via REST endpoints
- Comment posting requires Firebase ID token authentication

## Client Implementation

### Basic WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = function() {
  console.log('WebSocket connected');
};

ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'comment.created':
      handleNewComment(message.data);
      break;
    case 'comments.list':
      handleCommentsList(message.data);
      break;
    case 'test':
      console.log('Test message:', message.data.message);
      break;
  }
};

ws.onclose = function() {
  console.log('WebSocket disconnected');
  // Implement reconnection logic
};
```

### Error Handling
- Implement automatic reconnection with exponential backoff
- Handle connection failures gracefully
- Parse message errors should not break the connection

## Infrastructure

### AWS Architecture
- **API Gateway WebSocket**: Manages WebSocket connections
- **Lambda Functions**: Handle connection events and message broadcasting
- **DynamoDB**: Stores active connection IDs with TTL
- **Region**: ap-northeast-1 (Tokyo)

### Development Environment
- **LocalStack**: DynamoDB simulation
- **Serverless Offline**: WebSocket API simulation
- **Docker Compose**: Development services orchestration

## Performance Characteristics

### Scalability
- Supports up to 100,000 concurrent connections per AWS account
- Automatic scaling based on connection volume
- Message broadcasting controlled by Lambda concurrency

### Reliability
- Automatic connection cleanup with 24-hour TTL
- At-least-once message delivery guarantee
- Health monitoring via connection count endpoint

### Latency
- Sub-second message delivery for most messages
- ~100-200ms connection setup time
- Optimized for regional deployment (Tokyo)