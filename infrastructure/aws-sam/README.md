# Infrastructure Architecture

This document describes the AWS SAM infrastructure for the Next.js FastAPI Note Application.

**Note**: The `development` environment is configured for local Docker development only. Only `staging` and `production` environments are deployed to AWS and Vercel.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                              │
│  Next.js Frontend ←→ FastAPI Backend ←→ WebSocket Client       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                 │
│  HTTP API Gateway v2 ←→ WebSocket API Gateway v2               │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                     COMPUTE LAYER                               │
│  FastAPI Lambda ←→ WebSocket Handlers (Connect/Disconnect/     │
│  (Docker + ECR)    Default/Broadcast) - Node.js 20 + SDK v3   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  DynamoDB Tables: Notes, Users, WS Connections                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. **Data Layer - DynamoDB Tables**
- **NotesTable**: Unified storage for both public and private notes
- **UsersTable**: User profiles and authentication data
- **WebSocketConnectionsTable**: Active WebSocket connections with TTL

### 2. **API Layer - API Gateway v2**
- **HTTP API**: REST endpoints for the FastAPI backend
- **WebSocket API**: Real-time communication for comments
  - `$connect` → WebSocketConnectFunction
  - `$disconnect` → WebSocketDisconnectFunction  
  - `$default` → WebSocketDefaultFunction
- **Broadcasting**: HTTP endpoint `/websocket/broadcast` → WebSocketBroadcastFunction

### 3. **Compute Layer - Lambda Functions**

#### FastAPI Backend (`NoteAPIFunction`)
- **Runtime**: Docker container images with ECR
- **Purpose**: Note management API with public/private notes and user profiles
- **Integration**: Lambda Function URL (direct HTTP access)

#### WebSocket Handlers (Node.js 20.x + AWS SDK v3)
- **WebSocketConnectFunction**: Manages new connections
- **WebSocketDisconnectFunction**: Cleans up disconnected clients
- **WebSocketDefaultFunction**: Handles incoming WebSocket messages (echo)
- **WebSocketBroadcastFunction**: HTTP-triggered broadcasting to all clients

### 4. **Shared Utilities Architecture**

```
websocket-handlers/
├── connect.ts          # Connection handler
├── disconnect.ts       # Disconnection handler
├── default.ts          # Message handler
├── broadcast.ts        # Broadcasting handler
├── shared/             # Shared utilities directory
├── types/              # TypeScript type definitions
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Key Improvements

### ✅ **Code Organization**
- **Shared utilities** eliminate code duplication
- **Consistent error handling** across all handlers
- **Type safety** with comprehensive TypeScript interfaces
- **Service layer** for complex business logic

### ✅ **Performance & Reliability**
- **Chunked broadcasting** prevents API throttling
- **Stale connection cleanup** with 410 error handling
- **Pagination** for large connection tables
- **Connection TTL** for automatic cleanup

### ✅ **Monitoring & Debugging**
- **Structured logging** with configurable log levels
- **Comprehensive error handling** with detailed responses
- **CloudWatch integration** with proper log groups
- **Request/response correlation** for debugging

### ✅ **Security & Best Practices**
- **Environment validation** for required variables
- **CORS configuration** per environment
- **IAM least privilege** with scoped permissions
- **Input validation** for all handler inputs

## Environment Configuration

### Required Environment Variables
```bash
# Core Configuration
AWS_REGION=ap-northeast-1
ENVIRONMENT=staging|production  # development is Docker-only

# DynamoDB Configuration  
DYNAMODB_CONNECTIONS_TABLE=stack-name-websocket-connections

# WebSocket Configuration
WEBSOCKET_API_ENDPOINT=https://api-id.execute-api.region.amazonaws.com/stage

# Application Configuration
LOG_LEVEL=DEBUG|INFO|WARN|ERROR
CORS_ORIGIN=https://your-domain.com  # Vercel deployment URL
FIREBASE_PROJECT_ID=your-project-id
```

## Deployment

### Local Development (Docker Only)
The `development` environment is configured for local Docker development and **does not deploy to AWS**. Use `docker-compose.yml` for local development instead.

### Staging Deployment
```bash
# Build WebSocket handlers
./build-websocket-handlers.sh

# Deploy SAM template (creates ECR repository)
sam deploy --config-env staging

# Build and push Docker image
ECR_URI=$(aws cloudformation describe-stacks --stack-name next-fastapi-note-app-staging --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' --output text)
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin $ECR_URI
cd ../../ && docker build -f backend/Dockerfile.lambda -t $ECR_URI:latest .
docker push $ECR_URI:latest

# Update Lambda function
cd infrastructure/aws-sam && sam deploy --config-env staging
```

### Production Deployment
```bash
# Build WebSocket handlers
./build-websocket-handlers.sh

# Deploy SAM template (creates ECR repository)
sam deploy --config-env production

# Build and push Docker image
ECR_URI=$(aws cloudformation describe-stacks --stack-name next-fastapi-note-app-production --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' --output text)
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin $ECR_URI
cd ../../ && docker build -f backend/Dockerfile.lambda -t $ECR_URI:latest .
docker push $ECR_URI:latest

# Update Lambda function
cd infrastructure/aws-sam && sam deploy --config-env production
```

## Cost Optimization

- **DynamoDB**: Pay-per-request billing, PITR disabled
- **Lambda**: Right-sized memory allocation, efficient runtimes
- **API Gateway**: Auto-scaling with usage-based pricing
- **CloudWatch**: Environment-specific log retention (7d staging, 30d production)

## Testing Strategy

### Unit Testing
- WebSocket handler functions
- Shared utility functions  
- Error handling scenarios

### Integration Testing
- End-to-end WebSocket communication
- Broadcasting to multiple connections
- Stale connection cleanup

### Load Testing
- High-volume connection handling
- Broadcasting performance under load
- Database performance with large datasets
