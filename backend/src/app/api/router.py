from fastapi import APIRouter
from .routes.notes import router as notes_router
from .routes.me_notes import router as me_notes_router
from .routes.me import router as me_router
from .routes.auth import router as auth_router
from .routes.comments import router as comments_router


api_router = APIRouter()

# Public notes endpoints
api_router.include_router(notes_router)
api_router.include_router(comments_router)
api_router.include_router(me_notes_router)
api_router.include_router(me_router)
api_router.include_router(auth_router)
