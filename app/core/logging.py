import logging
import re
import sys
from typing import Any

_SENSITIVE_PATTERNS = (
    re.compile(r'(?i)(Authorization\s*:\s*Bearer\s+)[^\s]+'),
    re.compile(r'(?i)(X-User-Id\s*[:=]\s*)[^\s,;]+'),
    re.compile(r'(?i)(Cookie\s*[:=]\s*)[^;]+'),
)


class SensitiveDataFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = str(record.getMessage())
        for pattern in _SENSITIVE_PATTERNS:
            message = pattern.sub(r'\1[REDACTED]', message)
        record.msg = message
        record.args = ()
        return True


def configure_logging() -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers.clear()
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(SensitiveDataFilter())
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s'))
    root_logger.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
