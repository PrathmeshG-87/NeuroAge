from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.assessment import Assessment


class Report(Base):
    __tablename__ = 'reports'

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    assessment_id: Mapped[str] = mapped_column(String(64), ForeignKey('assessments.id'), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default='processing', index=True)
    file_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    format: Mapped[str] = mapped_column(String(32), nullable=False, default='pdf')
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    assessment: Mapped['Assessment'] = relationship(back_populates='reports')
