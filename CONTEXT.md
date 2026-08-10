# CONTEXT.md — Domain Model & Glossary

## Glossary
- **Expert**: Team member (e.g., Niyaz, Mikhail). Found in `website/app/[slug]/(Expert)/_data.tsx`.
- **Project**: Agency case study with metrics and media. Found in `website/app/[slug]/(Project)/_data.tsx`.
- **Client**: Organizations for whom projects are built.
- **Order**: Lead generation via Yandex Forms.
- **Main Service**: The core API handling Auth (OTP/Email), User management, and Product/Project catalogs.

## Architecture Principles
1. **Vertical Slicing**: Features should be implemented through all layers (Schema -> Model -> API -> Frontend Component).
2. **Deep Modules**: Prefer modules with simple interfaces that hide complex implementation details.
3. **Seam-based Testing**: Test at the highest feasible boundary (API endpoints or UI integration).

## Core Data Relationships
- Experts lead Projects.
- Projects are linked to Clients.
- Auth is handled via JWT (Access/Refresh tokens) with OTP verification via Valkey cache.