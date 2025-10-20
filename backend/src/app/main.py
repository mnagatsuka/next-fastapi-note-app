from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure generated models are importable (side-effect import)
from app.shared import generated_imports  # noqa: F401

from app.api.router import api_router
from app.shared.config import get_settings


def create_app() -> FastAPI:
    app = FastAPI(title="Simple Note Application API", version="1.0.0")

    # CORS - Only add CORS middleware for local development
    # In deployed environments (staging/production), AWS Lambda Function URL handles CORS
    settings = get_settings()
    if settings.environment == "development":
        origins = list(settings.cors_allowed_origins)
        # Can't use allow_credentials=True with allow_origins=["*"]
        allow_credentials = not (len(origins) == 1 and origins[0] == "*")
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=allow_credentials,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    app.include_router(api_router)

    # Lightweight health endpoint for Lambda Web Adapter readiness
    @app.get("/healthz")
    def healthz():
        return {"status": "ok"}
    return app


app = create_app()
