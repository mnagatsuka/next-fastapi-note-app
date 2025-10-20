# Project Overview

## Purpose
This is a **Note-Taking Application** built with Next.js (frontend) and FastAPI (backend). It supports both public and private notes with user authentication via Firebase.

## Tech Stack

### Frontend
- **Next.js 15.1.6** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.7.2** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **Radix UI** - Component library (Dialog, Dropdown, Toast, etc.)
- **TanStack Query 5.62.8** - Data fetching and state management
- **Zustand 5.0.2** - State management
- **Firebase 11.0.2** - Authentication
- **Zod 3.23.8** - Schema validation
- **Biome 1.9.4** - Linting and formatting
- **Vitest 2.1.8** - Testing framework
- **MSW 2.11.2** - API mocking for tests

### Backend
- **FastAPI 0.115.0+** - Web framework
- **Python 3.11+** - Programming language
- **Uvicorn 0.24.0+** - ASGI server
- **Pydantic 2.0+** - Data validation
- **boto3/botocore** - AWS SDK for DynamoDB
- **firebase-admin** - Firebase authentication
- **pytest** - Testing framework
- **ruff** - Linting and formatting
- **mypy** - Type checking
- **uv** - Package management

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **LocalStack** - AWS services emulation
- **DynamoDB** - Database (with in-memory alternative)
- **Firebase Auth** - Authentication
- **AWS Lambda** - Serverless deployment option

## Architecture
- **Clean Architecture** with Domain-Driven Design (DDD)
- **OpenAPI-first approach** with code generation
- **Environment-driven dependency injection**
- **Repository pattern** with switchable implementations