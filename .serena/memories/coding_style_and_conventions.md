# Coding Style and Conventions

## Backend (Python)

### Code Quality Tools
- **ruff**: Linting and formatting (line length: 100)
- **mypy**: Type checking with strict settings
- **pytest**: Testing framework

### Style Configuration (pyproject.toml)
```toml
[tool.ruff]
target-version = "py311"
line-length = 100
extend-exclude = ["src/app/generated"]

[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP", "ARG", "SIM"]
ignore = ["E501", "B008", "ARG001", "ARG002"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

[tool.mypy]
python_version = "3.11"
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
strict_equality = true
```

### Naming Conventions
- **Files**: snake_case (e.g., `notes_service.py`)
- **Classes**: PascalCase (e.g., `NotesService`)
- **Functions/Methods**: snake_case (e.g., `get_note_by_id`)
- **Variables**: snake_case
- **Constants**: UPPER_SNAKE_CASE

### Type Hints
- **Required**: All function signatures must have type hints
- **Strict**: mypy configured with strict settings
- **Pydantic**: Use for data validation and serialization

### Documentation
- **Docstrings**: Required for public classes and methods
- **Type annotations**: Comprehensive type hints

## Frontend (TypeScript)

### Code Quality Tools
- **Biome 1.9.4**: Linting and formatting
- **TypeScript**: Type checking
- **Vitest**: Testing framework

### Naming Conventions
- **Files**: 
  - Components: PascalCase (e.g., `NotesGrid.tsx`)
  - Hooks: camelCase starting with "use" (e.g., `useNoteNavigation.ts`)
  - Utilities: camelCase (e.g., `customFetch.ts`)
- **Components**: PascalCase (e.g., `UnifiedNotesGrid`)
- **Functions**: camelCase (e.g., `getNoteById`)
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE or camelCase for objects

### React Patterns
- **Functional Components**: Use function declarations
- **Hooks**: Custom hooks start with "use"
- **State Management**: Zustand for client state, TanStack Query for server state
- **Styling**: Tailwind CSS with utility classes

### File Organization
- **Components**: Organized by feature/domain
- **Hooks**: Separate directory for custom hooks
- **Stores**: Zustand stores in `lib/stores/`
- **API**: API client logic in `lib/api/`

## General Principles

### Clean Architecture
- **Domain Layer**: Core business entities and rules
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: External concerns (DB, APIs)
- **Interface Layer**: Controllers, presenters, UI

### Error Handling
- **Backend**: Use proper HTTP status codes and error responses
- **Frontend**: Use error boundaries and proper error states

### Testing
- **Backend**: Unit tests with pytest, async testing support
- **Frontend**: Component testing with Vitest and Testing Library
- **API**: MSW for mocking in tests