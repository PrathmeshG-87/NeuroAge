from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class ErrorDetail(BaseModel):
    model_config = ConfigDict(extra='forbid')

    loc: list[str] | None = None
    msg: str
    type: str


class ErrorResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')

    code: str
    message: str
    details: Any | None = None
    request_id: str | None = None


class HealthCheckResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')

    status: str
    service: str
    version: str
    environment: str
    checks: dict[str, str]
