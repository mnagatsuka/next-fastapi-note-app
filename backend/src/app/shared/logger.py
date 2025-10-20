from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict


_configured = False


class JsonFormatter(logging.Formatter):
    """Lightweight JSON formatter suitable for CloudWatch/Lambda logs."""

    # Known LogRecord attributes we don't want to duplicate into extras
    _skip = set(
        [
            "name",
            "msg",
            "args",
            "levelname",
            "levelno",
            "pathname",
            "filename",
            "module",
            "exc_info",
            "exc_text",
            "stack_info",
            "lineno",
            "funcName",
            "created",
            "msecs",
            "relativeCreated",
            "thread",
            "threadName",
            "processName",
            "process",
        ]
    )

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        ts = datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()
        base: Dict[str, Any] = {
            "time": ts,
            "level": record.levelname.lower(),
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Collect extra fields passed via `extra={}`
        extra: Dict[str, Any] = {}
        for k, v in record.__dict__.items():
            if k not in self._skip and not k.startswith("_"):
                extra[k] = v
        if extra:
            base["extra"] = extra
        if record.exc_info:
            base["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(base, ensure_ascii=False)


def _level_from_env() -> int:
    level = (os.getenv("LOG_LEVEL") or "info").lower()
    return {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warning": logging.WARNING,
        "error": logging.ERROR,
        "critical": logging.CRITICAL,
    }.get(level, logging.INFO)


def init_logger() -> None:
    global _configured
    if _configured:
        return
    root = logging.getLogger()
    root.setLevel(_level_from_env())

    # Clear existing handlers to avoid duplicate logs across reloads
    for h in list(root.handlers):
        root.removeHandler(h)

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    _configured = True


def get_logger(name: str) -> logging.Logger:
    if not _configured:
        init_logger()
    return logging.getLogger(name)

