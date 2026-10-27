"""Initial database schema for NeuroAge assessment domain.

Revision ID: 20261018_initial
Revises: 
Create Date: 2026-10-18 00:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '20261018_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'model_versions',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('architecture', sa.String(length=255), nullable=True),
        sa.Column('version', sa.String(length=64), nullable=False),
        sa.Column('dataset_name', sa.String(length=255), nullable=True),
        sa.Column('evaluation_dataset', sa.String(length=255), nullable=True),
        sa.Column('mae', sa.Float(), nullable=True),
        sa.Column('rmse', sa.Float(), nullable=True),
        sa.Column('pearson_r', sa.Float(), nullable=True),
        sa.Column('n_test_samples', sa.Integer(), nullable=True),
        sa.Column('bias_corrected', sa.Boolean(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_model_versions_id'), 'model_versions', ['id'], unique=False)
    op.create_index(op.f('ix_model_versions_name'), 'model_versions', ['name'], unique=False)

    op.create_table(
        'assessments',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('owner_id', sa.String(length=64), nullable=True),
        sa.Column('subject_id', sa.String(length=128), nullable=True),
        sa.Column('chronological_age', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('file_key', sa.String(length=512), nullable=True),
        sa.Column('preprocessing_version', sa.String(length=128), nullable=True),
        sa.Column('inference_status', sa.String(length=64), nullable=True),
        sa.Column('model_version_id', sa.String(length=64), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('output_payload', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['model_version_id'], ['model_versions.id']),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)
    op.create_index(op.f('ix_assessments_model_version_id'), 'assessments', ['model_version_id'], unique=False)
    op.create_index(op.f('ix_assessments_owner_id'), 'assessments', ['owner_id'], unique=False)
    op.create_index(op.f('ix_assessments_status'), 'assessments', ['status'], unique=False)
    op.create_index(op.f('ix_assessments_subject_id'), 'assessments', ['subject_id'], unique=False)

    op.create_table(
        'reports',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('assessment_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('file_key', sa.String(length=512), nullable=True),
        sa.Column('format', sa.String(length=32), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_reports_assessment_id'), 'reports', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)

    op.create_table(
        'audit_events',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('assessment_id', sa.String(length=64), nullable=True),
        sa.Column('event_type', sa.String(length=64), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_audit_events_assessment_id'), 'audit_events', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_audit_events_event_type'), 'audit_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_audit_events_id'), 'audit_events', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_audit_events_id'), table_name='audit_events')
    op.drop_index(op.f('ix_audit_events_event_type'), table_name='audit_events')
    op.drop_index(op.f('ix_audit_events_assessment_id'), table_name='audit_events')
    op.drop_table('audit_events')

    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_assessment_id'), table_name='reports')
    op.drop_table('reports')

    op.drop_index(op.f('ix_assessments_subject_id'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_status'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_owner_id'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_model_version_id'), table_name='assessments')
    op.drop_index(op.f('ix_assessments_id'), table_name='assessments')
    op.drop_table('assessments')

    op.drop_index(op.f('ix_model_versions_name'), table_name='model_versions')
    op.drop_index(op.f('ix_model_versions_id'), table_name='model_versions')
    op.drop_table('model_versions')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
