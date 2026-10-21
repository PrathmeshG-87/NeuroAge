from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timezone

from sqlalchemy import Select, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.db.models import Assessment


class AssessmentRepository:
    def __init__(self, engine: Engine):
        self.engine = engine

    def create_assessment(
        self,
        *,
        user_id: str | None,
        subject_id: str | None,
        chronological_age: float | None,
        status: str,
        file_key: str | None,
        model_version_id: str | None,
        created_at: datetime | None = None,
        output_payload: dict | None = None,
    ) -> Assessment:
        timestamp = created_at or datetime.now(timezone.utc)
        with Session(self.engine) as session:
            assessment = Assessment(
                id=f'assessment_{session.query(Assessment).count() + 1}',
                owner_id=user_id,
                subject_id=subject_id,
                chronological_age=chronological_age,
                status=status,
                uploaded_at=timestamp,
                file_key=file_key,
                model_version_id=model_version_id,
                output_payload=output_payload,
                created_at=timestamp,
                updated_at=timestamp,
            )
            session.add(assessment)
            session.commit()
            session.refresh(assessment)
            return assessment

    def update_status(
        self,
        assessment_id: str,
        status: str,
        *,
        started_at: datetime | None = None,
        finished_at: datetime | None = None,
        output_payload: dict | None = None,
        error_message: str | None = None,
    ) -> Assessment:
        with Session(self.engine) as session:
            assessment = session.get(Assessment, assessment_id)
            if assessment is None:
                raise ValueError(f'Assessment {assessment_id} not found')

            assessment.status = status
            if started_at is not None:
                assessment.started_at = started_at
            if finished_at is not None:
                assessment.finished_at = finished_at
            if output_payload is not None:
                assessment.output_payload = output_payload
            if error_message is not None:
                assessment.error_message = error_message

            session.commit()
            session.refresh(assessment)
            return assessment

    def list_assessments(
        self,
        *,
        status: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Sequence[Assessment]:
        with Session(self.engine) as session:
            stmt: Select[tuple[Assessment]] = select(Assessment)
            if status is not None:
                stmt = stmt.where(Assessment.status == status)
            stmt = stmt.order_by(Assessment.created_at.desc()).offset(offset).limit(limit)
            return session.execute(stmt).scalars().all()
