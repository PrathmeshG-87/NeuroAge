# Security and retention policy

This document defines the minimum backend controls that should remain in place while the production authentication provider and deployment architecture are being finalized.

## Identity and authorization contract

- The backend does not trust the frontend alone to enforce authorization.
- Protected endpoints require an authenticated user identity from the backend contract, currently represented by the `X-User-Id` header or an Authorization bearer token in the form `Bearer neuroage-user:<user_id>`.
- Assessment IDs are never treated as secrets and cannot be used as an authorization mechanism.
- The backend must reject requests when the user context is missing, malformed, or does not match the owner of the record.
- This model is intentionally temporary and must be replaced with the approved identity provider once the frontend and backend contract is confirmed.

## Upload and request controls

- MRI uploads are limited to `.nii` and `.nii.gz` files and a configured maximum payload size.
- Upload, assessment creation, and report download endpoints enforce request rate limits to reduce abuse of resource-intensive operations.
- Request data is validated server-side before processing, and untrusted filenames are sanitized before being stored.
- Secrets and credentials are read from environment variables and never hardcoded in source files.

## Privacy and logging

- MRI content, access tokens, passwords, and bearer values are never logged in full.
- Security events are logged with a sanitized user identifier and a specific action label, but without exporting MRI bytes or raw credentials.
- Only the minimum operational metadata needed for auditing is collected.

## Retention and deletion

- Uploaded MRI files are retained only for the minimum operational window required for assessment processing and incident response.
- Default retention window: 30 days for uploaded MRI content and derived working files, unless a stricter project requirement is formally adopted.
- Records that are no longer needed are deleted by a scheduled cleanup task or a secure admin action that removes both the file artifact and the linked assessment metadata.
- Access logs and audit events should be retained for the shortest period required by the project’s operational policy and must be reviewed before any extended retention is adopted.

## Scope note

This policy is an engineering control document and does not claim compliance with any medical privacy framework. Applicability of HIPAA, GDPR, or similar requirements must be determined by the project owner and deployment environment before production use.
