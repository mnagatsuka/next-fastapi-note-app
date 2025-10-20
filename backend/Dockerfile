FROM python:3.13-slim AS base

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy project config from backend directory (build context is root)
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Copy backend source code
COPY backend/src/ ./src/

EXPOSE 8000

# Set PYTHONPATH so Python can find the modules
ENV PYTHONPATH=/app/src/app

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

