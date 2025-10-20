# Frontend

## Applicable Versions

These guidelines are written for:

- **Next.js**: `15.x` and later  
- **React**: `18.x` (including support for React Server Components)  
- **TypeScript**: `5.x` with strict compiler settings enabled  

The recommendations may not apply to older versions.


## Libraries & Tools in Scope

While the primary focus is **Next.js + TypeScript**, the following libraries and tools are part of our standard setup:

### 1. State Management
- **Zustand** — minimal and flexible client state management  
- **TanStack Query** — server state fetching and caching

### 2. Data Fetching & API
- **TanStack Query** — async data fetching, caching, and sync

### 3. Forms & Validation
- **Zod** — TypeScript-first schema validation

### 4. Styling & UI Components
- **Tailwind CSS** — utility-first CSS framework  
- **shadcn/ui** — headless UI components built with Tailwind

### 5. Authentication & Security
- **Firebase Auth** — authentication with identity providers

### 6. Internationalization (i18n)
- **next-intl**

### 7. Testing
- **Vitest** — Vite-native unit/integration testing  
- **Testing Library** (React Testing Library) — DOM testing utilities  
- **Playwright** — modern E2E testing framework  
- **MSW** (Mock Service Worker) — API mocking for tests

### 8. Storybook & Design Systems
- **Storybook** — isolated UI development and documentation

### 9. Performance & Monitoring
- **Lighthouse** — performance monitoring and analysis in Chrome

### 10. Deployment & CI/CD
- **Vercel** — official Next.js hosting

### 11. Developer Experience
- **Biome** — code linter and formatter  
- **pnpm** — fast, disk space-efficient package manager

### 12. Local Development & Testing Environment
- **Docker** — containerized development environment  
- **Docker Compose** — multi-container orchestration for local setup and testing


## Architectural Principles

Our frontend follows these core architectural principles:

### 1. OpenAPI-First Development
- Single source of truth in `docs/api` directory
- Contract-driven development with schema validation
- Code generation from OpenAPI specifications with `orval` and `@redocly/cli`


# Backend

## Applicable Versions

These guidelines are written for:

- **Python**: `3.13` and later
- **FastAPI**: Latest stable version with ASGI support
- **AWS Lambda Web Adapter**: For serverless deployment
- **Firebase Auth**: For authentication and authorization

The recommendations may not apply to older versions.


## Libraries & Tools in Scope

While the primary focus is **Python + FastAPI**, the following libraries and tools are part of our standard setup:

### 1. Web Framework & API
- **FastAPI**  modern, fast web framework for building APIs with Python
- **ASGI**  asynchronous server gateway interface
- **AWS Lambda Web Adapter**  serverless deployment adapter

### 2. Authentication & Security
- **Firebase Auth**  authentication with identity providers and token verification

### 3. Data Storage & AWS Services
- **DynamoDB**  NoSQL database for scalable data storage
- **S3**  object storage for media and file uploads
- **AWS SDK (boto3)**  AWS service integration

### 4. Validation & Schema Management
- **Pydantic**  data validation and settings management using Python type annotations
- **OpenAPI/Swagger**  API documentation and contract-first development

### 5. Development Tools & Environment
- **uv**  fast Python package installer and resolver for dependency management
- **Ruff**  extremely fast Python linter and formatter
- **pyproject.toml**  modern Python project configuration

### 6. Testing Framework
- **pytest**  mature full-featured Python testing tool
- **LocalStack**  local AWS cloud stack for testing

### 7. Local Development & Testing Environment
- **Docker** — containerized development environment  
- **Docker Compose** — multi-container orchestration for local setup and testing


## Architectural Principles

Our backend follows these core architectural principles:

### 1. OpenAPI-First Development
- Single source of truth in `docs/api` directory
- Contract-driven development with schema validation
- Code generation from OpenAPI specifications with `@openapitools/openapi-generator-cli` and `@redocly/cli`

### 2. Clean Architecture
- Clear separation of concerns across layers
- Dependency inversion and ports/adapters pattern
- Domain-driven design principles

### 3. Hexagonal Architecture (Ports & Adapters)
- **Domain Layer**: Pure business logic, entities, and value objects
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External adapters (databases, APIs, services)
- **API Layer**: Transport layer with FastAPI routers


## Layer Structure

Our codebase is organized into distinct layers:

- **`api/`**  Transport layer: FastAPI routers, request/response mappers
- **`application/`**  Use cases/services, orchestrations, ports (interfaces)
- **`domain/`**  Entities, value objects, domain services, domain events
- **`infra/`**  Adapters: DynamoDB repos, S3 gateways, outbound HTTP clients, Firebase verification
- **`shared/`**  Cross-cutting concerns: config, errors, logging, time, ULID/UUID generation


# Infrastructure

## Infrastructure Components

### 1. AWS SAM Template
The consolidated `aws-sam/template.yml` includes:

- **FastAPI Backend**: Lambda with Web Adapter
- **DynamoDB Tables**: Posts, Comments, Favorites, WebSocket Connections
- **WebSocket API**: Real-time communication
- **HTTP API Gateway**: REST endpoints
- **CloudWatch Logs**: Monitoring and debugging
- **IAM Roles**: Least privilege permissions

### 2. Serverless WebSocket API
- **TypeScript handlers** for connect/disconnect/broadcast
- **Development server** with serverless-offline
- **Comprehensive testing** with Vitest
- **Production deployment** to AWS API Gateway V2

### 3. DynamoDB Local (via Serverless)
- **DynamoDB Local** started automatically by `serverless offline`
- **Tables auto-created** from `resources` with `migrate: true`

## Environment Configuration

### Development
- LocalStack (DynamoDB): `http://localstack:4566` from Docker network, or `http://localhost:4566` on host
- Serverless WebSocket: `ws://localhost:3001` (docker-compose exposes container 3001 → host 3001)
- Serverless HTTP (offline): `http://localhost:3002` (docker-compose exposes container 3000 → host 3002)
- FastAPI Backend: `http://localhost:8000`
- Next.js Frontend: `http://localhost:3000`

### Production & Staging
Environment variables managed by AWS SAM template:
- DynamoDB table names with environment prefixes
- WebSocket API URLs with proper stages
- CORS configuration by environment
