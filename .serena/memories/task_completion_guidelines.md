# Task Completion Guidelines

## Code Quality Checklist

### Before Committing Code
1. **Backend Quality Checks** (from `backend/`):
   ```bash
   # Lint and format
   uv run ruff check --fix src/
   uv run ruff format src/
   
   # Type checking
   uv run mypy src/
   
   # Run tests
   uv run pytest
   ```

2. **Frontend Quality Checks** (from `frontend/`):
   ```bash
   # Lint and format
   pnpm format
   pnpm lint
   
   # Type checking
   pnpm typecheck
   
   # Run tests
   pnpm test
   ```

### API Changes
If backend API changes:
1. **Update OpenAPI spec** in `docs/api/openapi.yml`
2. **Generate backend code**: `pnpm api:be`
3. **Generate frontend client**: `pnpm api:fe`
4. **Update frontend code** to use new API structure

### Testing Requirements
- **Backend**: All new functions/classes should have unit tests
- **Frontend**: Components should have basic rendering tests
- **Integration**: Test API endpoints with realistic scenarios
- **Mocking**: Use MSW for frontend API mocking

### Documentation Updates
- Update inline comments for complex logic
- Update API documentation if endpoints change
- Update README if setup instructions change
- No need to create new markdown files unless explicitly requested

### Environment Considerations
- **Development**: Use in-memory repositories and Firebase emulator
- **Production**: Switch to DynamoDB and production Firebase
- **Configuration**: Use environment variables for all external services

## Git Best Practices

### Commit Messages
- Use clear, descriptive messages
- Start with action verbs (Add, Update, Fix, Remove)
- Include scope when relevant (frontend, backend, api)

### Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names (feature/add-note-editing)
- Merge back to `main` when complete

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Type checking passes
- [ ] No console errors or warnings
- [ ] API changes are properly documented
- [ ] Environment variables are documented

## Deployment Checklist

### Pre-deployment
1. All tests pass
2. Code quality checks pass
3. API documentation is up to date
4. Environment variables are configured
5. Dependencies are up to date

### Deployment Types
- **Development**: Docker Compose setup
- **Production**: AWS Lambda + DynamoDB
- **Testing**: LocalStack for AWS services

## Error Handling Standards

### Backend
- Use appropriate HTTP status codes
- Return structured error responses
- Log errors with appropriate levels
- Handle async operations properly

### Frontend
- Use error boundaries for component errors
- Display user-friendly error messages
- Handle loading and error states
- Retry mechanisms for network errors

## Performance Considerations

### Backend
- Use async/await for I/O operations
- Implement proper caching strategies
- Optimize database queries
- Use connection pooling

### Frontend
- Implement proper loading states
- Use React Query for caching
- Optimize bundle size
- Use lazy loading for routes

## Security Considerations

### Authentication
- Validate Firebase tokens on backend
- Use proper CORS configuration
- Implement proper session management
- Handle token refresh

### Data Validation
- Validate all inputs with Pydantic (backend)
- Validate all inputs with Zod (frontend)
- Sanitize data before storage
- Use proper type checking