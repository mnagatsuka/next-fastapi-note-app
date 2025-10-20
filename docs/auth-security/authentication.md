# Authentication Flow Specification with FirebaseAuth

## Overview

This document specifies the authentication and API request flow patterns for Firebase-based authentication in web applications, covering anonymous user authentication, permanent user authentication, and user promotion workflows.

## Authentication Flow Patterns

### 1. Anonymous User Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Firebase
    participant API as API Server
    participant DB as Database

    C->>F: signInAnonymously()
    F-->>C: anonymous_token
    C->>API: POST /auth/anonymous-login
    Note over C,API: Authorization: Bearer {anonymous_token}
    API->>F: verify(anonymous_token)
    F-->>API: validated_user_data
    API->>DB: check_user_exists(firebase_uid)
    alt User does not exist
        API->>DB: create_anonymous_user()
        DB-->>API: user_created
    else User exists
        API->>DB: get_user_data()
        DB-->>API: existing_user_data
    end
    API-->>C: authentication_response
```

**Flow Characteristics:**
- Single-step authentication process
- Automatic user creation on first authentication
- No email verification required
- Temporary user identity

### 2. Regular User Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Firebase
    participant API as API Server
    participant DB as Database

    C->>F: signInWithProvider(credentials)
    F-->>C: permanent_token
    C->>API: GET /auth/login
    Note over C,API: Authorization: Bearer {permanent_token}
    API->>F: verify(permanent_token)
    F-->>API: validated_user_data
    API->>DB: check_user_exists(firebase_uid)
    alt User does not exist
        API->>DB: create_permanent_user()
        DB-->>API: user_created
    else User exists
        API->>DB: update_user_data()
        DB-->>API: user_updated
    end
    API-->>C: authentication_response
```

**Flow Characteristics:**
- Provider-based authentication (Google, Apple, Twitter, Email/Password)
- Email verification for certain providers
- Permanent user identity
- User data synchronization with provider

### 3. Anonymous User Promotion Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Firebase
    participant API as API Server
    participant DB as Database

    Note over C: User has anonymous account
    C->>F: linkWithProvider(credentials)
    F-->>C: permanent_token
    C->>API: POST /auth/anonymous-promote
    Note over C,API: Authorization: Bearer {permanent_token}<br/>Body: {anonymous_firebase_uuid}
    API->>F: verify(permanent_token)
    F-->>API: validated_permanent_data
    API->>DB: validate_anonymous_user(anonymous_uuid)
    DB-->>API: anonymous_user_data
    API->>DB: update_user_credentials()
    Note over DB: Preserve all user data<br/>Update authentication info
    DB-->>API: promotion_completed
    API-->>C: promotion_response
```

**Flow Characteristics:**
- Converts temporary identity to permanent
- Preserves all user data and relationships
- Validates ownership of anonymous account
- Updates authentication credentials only

## API Request Flow Patterns

### 1. Public API Request Pattern

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant Service as Business Logic
    participant DB as Database

    C->>API: API Request (Public Resource)
    Note over C,API: No Authorization header required
    API->>Service: process_public_request(request_data)
    Service->>DB: fetch_public_data()
    DB-->>Service: public_data
    Service-->>API: response_data
    API-->>C: API Response
```

**Request Characteristics:**
- No authentication required
- Public content and resources only
- Rate limiting applied per IP/session
- No user context available
- Limited functionality scope

### 2. Authenticated API Request Pattern

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant Auth as Auth Middleware
    participant DB as Database
    participant Service as Business Logic

    C->>API: API Request
    Note over C,API: Authorization: Bearer {firebase_token}
    API->>Auth: authenticate(token)
    Auth->>DB: validate_user(firebase_uid)
    DB-->>Auth: user_data
    Auth-->>API: authenticated_user_context
    API->>Service: process_request(user_context, request_data)
    Service->>DB: business_operations()
    DB-->>Service: operation_results
    Service-->>API: response_data
    API-->>C: API Response
```

**Request Characteristics:**
- Bearer token authentication required
- User context automatically injected
- Rate limiting applied per user
- Business logic operates with validated user context

### 3. Error Handling Pattern

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant Auth as Auth Middleware

    C->>API: API Request (invalid/expired token)
    API->>Auth: authenticate(token)
    Auth-->>API: authentication_error
    API-->>C: 401 Unauthorized
    Note over C: Client must re-authenticate
    C->>API: Re-authentication flow
    API-->>C: New valid token
    C->>API: Retry original request
    API-->>C: Successful response
```


## Authentication States and Transitions

### User State Diagram

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Anonymous : signInAnonymously()
    Unauthenticated --> Permanent : signInWithProvider()
    
    Anonymous --> Permanent : promote()
    Anonymous --> Unauthenticated : logout()
    
    Permanent --> Unauthenticated : logout()
    
    state Unauthenticated {
        [*] --> Public_Access
        Public_Access --> Public_Access : access_public_resources
    }
    
    state Anonymous {
        [*] --> Limited_Private_Access
        Limited_Private_Access --> Limited_Private_Access : authenticated_operations
    }
    
    state Permanent {
        [*] --> Full_Access
        Full_Access --> Full_Access : all_operations
    }
```

**State Characteristics:**
- **Unauthenticated**: Public resource access only, no authentication required for public content
- **Anonymous**: Public + limited private functionality, temporary identity, promotion possible  
- **Permanent**: Public + full private functionality, persistent identity, provider-linked

## Token Management Patterns

### 1. Token Lifecycle

```mermaid
graph LR
    A[Client Authentication] --> B[Token Issued]
    B --> C[Token Cached]
    C --> D{Token Valid?}
    D -->|Yes| E[API Request]
    D -->|No| F[Token Refresh]
    F --> G{Refresh Success?}
    G -->|Yes| B
    G -->|No| A
    E --> H{Request Success?}
    H -->|401/403| F
    H -->|Success| I[Response]
```

### 2. ID Token Validation Sub-Flow

*This sub-flow is used by all authenticated endpoints for Firebase token validation*

```mermaid
graph TD
    A[Bearer Token] --> B{Token Present?}
    B -->|No| C[Return 401]
    B -->|Yes| D[Extract Token]
    D --> E[Verify with Firebase]
    E --> F{Token Valid?}
    F -->|No| C
    F -->|Yes| G[Return Decoded Token Data]
```

**Sub-Flow Characteristics:**
- **Function**: Firebase token validation only
- **Used by**: All authenticated endpoints (auth and regular APIs)
- **Returns**: Decoded Firebase token data (uid, email, provider, etc.)
- **No database operations**: Pure token validation

## Authentication API Flow Patterns

### 1. Anonymous Login Flow

```mermaid
flowchart TD
    A[Anonymous Login Request] --> B[ID Token Validation]
    B --> C{Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E{User Exists in DB?}
    E -->|Yes| F[Return Existing User]
    E -->|No| G[Create Anonymous User]
    G --> H[Initialize New User]
    H --> I[Set is_anonymous = true]
    I --> J[Set email = null]
    J --> K[Set name = Guest]
    K --> L[Return New User]
```

### 2. Anonymous Promotion Flow

```mermaid
flowchart TD
    A[Anonymous Promotion Request] --> B[ID Token Validation]
    B --> C{New Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E[Validate Anonymous Ownership]
    E --> F{Ownership Confirmed?}
    F -->|No| G[Return 403]
    F -->|Yes| H[Check Email Conflicts]
    H --> I{Email Available?}
    I -->|No| J[Return 409]
    I -->|Yes| K[Update Firebase UID]
    K --> L[Update Sign-in Provider]
    L --> M[Add Email/Profile Data]
    M --> N[Set is_anonymous = false]
    N --> O[Set Other data]
    O --> P[Preserve All User Data]
    P --> Q[Return Updated User]
```

### 3. Regular Sign Up Flow

```mermaid
flowchart TD
    A[Regular Login Request] --> B[ID Token Validation]
    B --> C{Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E{User Exists in DB?}
    E -->|Yes| F[Update User Data]
    F --> G[Return Existing User]
    E -->|No| H[Create Permanent User]
    H --> I[Extract Provider Data]
    I --> J[Set Email from Provider]
    J --> K[Set Name from Provider]
    K --> L[Set is_anonymous = false]
    L --> M[Set Other data]
    M --> N[Return New User]
```

### 4. Regular Login Flow

```mermaid
flowchart TD
    A[Regular Login Request] --> B[ID Token Validation]
    B --> C{Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E{User Exists in DB?}
    E -->|No| F[Return 401 - User Not Found]
    E -->|Yes| G[Update User Data]
    G --> H[Sync Provider Data]
    H --> I[Return User Info]
```

## Regular API Flow Patterns

### 1. Public API Request Flow

```mermaid
flowchart TD
    A[Public API Request] --> B[Route Handler Execution]
    B --> C[Process Public Logic]
    C --> D[Access Public Resources]
    D --> E[Return Public Response]
```

**Flow Characteristics:**
- **No authentication required**: Direct access to public resources
- **Public content only**: Limited to non-sensitive information
- **Rate limiting by IP/session**: Applied per client identifier
- **No user context**: Business logic operates without user data

### 2. Regular API Request Flow

```mermaid
flowchart TD
    A[Regular API Request] --> B[ID Token Validation]
    B --> C{Token Valid?}
    C -->|No| D[Return 401]
    C -->|Yes| E[Route Handler Execution]
    E --> F[Database User Lookup]
    F --> G{User Exists in DB?}
    G -->|No| H[Return 401 - firebase_uuid not in db]
    G -->|Yes| I[Process Business Logic]
    I --> J[Return Response]
```

**Flow Characteristics:**
- **Authentication required**: Bearer token validation mandatory
- **User context validated**: Database user lookup performed
- **Strict validation**: Returns 401 if user not found in database
- **Full business logic access**: Complete application functionality

## Error Response Patterns

### Standard Error Structure

```json
{
  "error": {
    "code": "ERROR_TYPE",
    "message": "Human readable description",
    "details": {
      "field": "specific_error_info"
    }
  }
}
```

### Common Error Scenarios

| Scenario | Status Code | Error Code | Description |
|----------|-------------|------------|-------------|
| Missing Token | 401 | `MISSING_AUTH_TOKEN` | Authorization header required |
| Invalid Token | 401 | `INVALID_AUTH_TOKEN` | Token verification failed |
| Expired Token | 401 | `EXPIRED_AUTH_TOKEN` | Token has expired |
| User Not Found | 401 | `USER_NOT_FOUND` | Firebase user not in database |
| Rate Limited | 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| Email Conflict | 409 | `EMAIL_EXISTS` | Email already registered |
| Invalid Promotion | 403 | `INVALID_PROMOTION` | Cannot promote this user |

## Integration Patterns

### 1. Client-Side Integration

```javascript
// Authentication Flow Pattern
class AuthService {
  async authenticateAnonymously() {
    const credential = await firebase.signInAnonymously()
    const token = await credential.user.getIdToken()
    return this.exchangeToken('/auth/anonymous-login', token)
  }
  
  async promoteAnonymous(newCredential) {
    const anonymousUid = firebase.auth().currentUser.uid
    await firebase.auth().currentUser.linkWithCredential(newCredential)
    const token = await firebase.auth().currentUser.getIdToken()
    return this.exchangeToken('/auth/anonymous-promote', token, { 
      anonymous_firebase_uuid: anonymousUid 
    })
  }
  
  async makePublicRequest(endpoint, data) {
    // No authentication required for public resources
    return fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
  
  async makeAuthenticatedRequest(endpoint, data) {
    const token = await firebase.auth().currentUser.getIdToken()
    return fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    })
  }
  
  async makeSmartRequest(endpoint, data, requireAuth = false) {
    // Handles both public and authenticated requests
    if (!requireAuth && !firebase.auth().currentUser) {
      return this.makePublicRequest(endpoint, data)
    }
    return this.makeAuthenticatedRequest(endpoint, data)
  }
}
```

### 2. Middleware Integration Pattern

```python
# Server-Side Middleware Pattern
class FirebaseAuthMiddleware:
    def process_request(self, request):
        if self.is_public_endpoint(request.path):
            request.user = None  # No authentication for public resources
            return request
            
        if self.is_optional_auth_endpoint(request.path):
            try:
                return self.authenticate(request)
            except AuthenticationError:
                request.user = None  # Allow public access with no user context
                return request
        
        # Required authentication
        return self.authenticate(request)
    
    def authenticate(self, request):
        token = self.extract_token(request)
        firebase_user = self.verify_token(token)
        user = self.get_or_create_user(firebase_user)
        request.user = user
        return request
    
    def get_or_create_user(self, firebase_user):
        if firebase_user.provider == 'anonymous':
            return self.create_anonymous_user(firebase_user)
        else:
            return self.create_or_update_user(firebase_user)
    
    def is_public_endpoint(self, path):
        public_patterns = ['/public/', '/health', '/status']
        return any(pattern in path for pattern in public_patterns)
    
    def is_optional_auth_endpoint(self, path):
        optional_patterns = ['/content/', '/articles/']
        return any(pattern in path for pattern in optional_patterns)
```

## Performance Considerations

### 1. Caching Strategy

```mermaid
graph LR
    A[Token Verification] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached User]
    B -->|No| D[Firebase Verification]
    D --> E[Database Query]
    E --> F[Cache Result]
    F --> G[Return User Data]
```

### 2. Rate Limiting Strategy

- **Per-user rate limiting**: Based on Firebase UID
- **Per-endpoint rate limiting**: Different limits for different operations
- **Anonymous user limits**: Stricter limits for temporary users
- **Promotion limits**: Special limits for sensitive operations

## Monitoring and Observability

### Key Metrics to Track

1. **Authentication Metrics**
   - Authentication success/failure rates
   - Token verification latency
   - User creation rates (anonymous vs permanent)

2. **Promotion Metrics**
   - Anonymous to permanent conversion rates
   - Promotion success/failure rates
   - Time between anonymous creation and promotion

3. **Security Metrics**
   - Rate limiting triggers
   - Invalid token attempts
   - Failed promotion attempts

4. **Performance Metrics**
   - API response times with authentication
   - Database query performance for user operations
   - Cache hit rates for user data

This specification provides the foundational patterns for implementing Firebase authentication flows while maintaining security, performance, and user experience standards.