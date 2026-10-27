from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.audit_event import AuditEvent
    from app.db.models.model_version import ModelVersion
    from app.db.models.report import Report
    from app.db.models.user import User


class Assessment(Base):
    __tablename__ = 'assessments'

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    owner_id: Mapped[str | None] = mapped_column(String(64), ForeignKey('users.id'), index=True, nullable=True)
    subject_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    chronological_age: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default='queued', index=True)
    uploaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    file_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    preprocessing_version: Mapped[str | None] = mapped_column(String(128), nullable=True)
    inference_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    model_version_id: Mapped[str | None] = mapped_column(String(64), ForeignKey('model_versions.id'), index=True, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    owner: Mapped['User'] = relationship(back_populates='assessments')
    model_version_rel: Mapped['ModelVersion | None'] = relationship(back_populates='assessments')
    reports: Mapped[list['Report']] = relationship(back_populates='assessment', cascade='all, delete-orphan')
    audit_events: Mapped[list['AuditEvent']] = relationship(back_populates='assessment', cascade='all, delete-orphan')
