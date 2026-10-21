from __future__ import annotations

import logging
import time
from collections import defaultdict, deque
from typing import Any

from fastapi import HTTPException, Request, status

logger = logging.getLogger('neuroage.security')

_RATE_LIMIT_BUCKETS: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def redact_sensitive_value(value: str | None) -> str:
    if not value:
        return '<empty>'
    if len(value) <= 8:
        return '***'
    return f'{value[:2]}***{value[-2:]}'


def log_security_event(
    *,
    action: str,
    user_id: str | None,
    assessment_id: str | None = None,
    allowed: bool,
    reason: str | None = None,
) -> None:
    logger.warning(
        'security_event action=%s user=%s assessment=%s allowed=%s reason=%s',
        action,
        redact_sensitive_value(user_id),
        assessment_id,
        allowed,
        reason or 'ok',
    )


def get_client_address(request: Request) -> str:
    forwarded = request.headers.get('X-Forwarded-For', '').split(',')[0].strip()
    if forwarded:
        return forwarded
    if request.client is not None:
        return request.client.host
    return 'unknown-client'


def optional_user_context(request: Request) -> str | None:
    auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
    if auth_header:
        scheme, _, token = auth_header.partition(' ')
        if scheme.lower() == 'bearer' and token:
            if token.startswith('neuroage-user:'):
                user_id = token.split(':', 1)[1].strip()
                if user_id:
                    return user_id
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Authentication required. Use the backend-approved user context header or bearer token format.',
            )

    user_id = request.headers.get('X-User-Id') or request.headers.get('x-user-id')
    if user_id and user_id.strip():
        return user_id.strip()
    return None


def require_user_context(request: Request) -> str:
    user_id = optional_user_context(request)
    if user_id:
        return user_id
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Authentication required. Supply X-User-Id or Authorization: Bearer neuroage-user:<user_id>.',
    )


def get_assessment_token(request: Request) -> str | None:
    token = request.headers.get('X-Assessment-Token') or request.headers.get('x-assessment-token')
    if token and token.strip():
        return token.strip()

    auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
    if auth_header:
        scheme, _, token_value = auth_header.partition(' ')
        if scheme.lower() == 'bearer' and token_value:
            if token_value.startswith('neuroage-assessment:'):
                token = token_value.split(':', 1)[1].strip()
                if token:
                    return token
    return None


def ensure_owned_assessment(assessment: dict[str, Any], user_id: str | None, *, action: str, access_token: str | None = None) -> None:
    owner_id = assessment.get('owner_id')
    access_match = bool(access_token) and assessment.get('access_token') == access_token

    if not user_id and not access_match:
        log_security_event(action=action, user_id=user_id, assessment_id=str(assessment.get('assessment_id')), allowed=False, reason='missing_assessment_access')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authentication required. Provide a user context or a valid assessment token.',
        )

    if owner_id in (None, 'anonymous'):
        if access_match:
            return
        if user_id and user_id == owner_id:
            return
        log_security_event(action=action, user_id=user_id, assessment_id=str(assessment.get('assessment_id')), allowed=False, reason='missing_assessment_access')
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are not authorized to access this assessment.',
        )
    if owner_id == user_id or access_match:
        return
    log_security_event(action=action, user_id=user_id, assessment_id=str(assessment.get('assessment_id')), allowed=False, reason='owner_mismatch')
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail='You are not authorized to access this assessment.',
    )


def check_rate_limit(request: Request, *, endpoint: str, limit_per_minute: int = 30) -> None:
    client_id = get_client_address(request)
    now = time.monotonic()
    bucket = _RATE_LIMIT_BUCKETS[(endpoint, client_id)]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail='Rate limit exceeded. Please try again shortly.',
        )
    bucket.append(now)
