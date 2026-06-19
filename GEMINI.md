# flixflex.com Project Instructions: The Army Protocol v2

Welcome to the flixflex.com project. This document serves as the supreme law for our development workflows, architectural standards, and the "Elite Developer Army" operational protocol.

## The Developer Army Protocol

This project is built and maintained by a specialized "army" of AI agents. All work MUST follow the Specialized Operational Lifecycle, coordinated by the Orchestrator.

### Operational Law
1. **Efficiency First:** The project uses a `.geminiignore` file to focus strictly on relevant files (src, prisma, public). Never waste tokens on static assets or build artifacts.
2. **Niche Mastery:** Every task must be handled by the specific specialist defined in `AGENTS.md`.
3. **Surgical Precision:** We prioritize targeted changes over massive refactors. Every change must be documented and verified.
4. **Validation is Final:** No change is complete without certification from GUARDIAN-QA.
5. **Full Transparency:** Every transition and major action must be communicated via `update_topic`. **Every response MUST conclude with the "Tactical Dashboard" from AGENTS.md.**

---

## The Army Flow (Standard Operating Procedure)

Every directive from the Commander follows this strict sequence to ensure maximum stability and quality:

### 🏛️ 1. Strategic Planning (ARCH-ANALYST)
- **Goal:** Analyze the request and design the structural blueprint.
- **Output:** A comprehensive strategy document and impact map. No code is written here.

### 🗺️ 2. Compliance Audit (COMP-STRATEGIST)
- **Goal:** Verify the plan against existing components and design standards.
- **Output:** Mandatory adjustments to reuse existing patterns and maintain DRY compliance.

### 🧙🎨 3. Tactical Implementation (BACKEND-SORCERER / FRONTEND-ARTIST)
- **Goal:** Execute the approved plan with surgical precision.
- **Output:** Verified code changes with 100% type safety and performance optimization.

### 🧪 4. Stability & Quality Review (STABILITY-SENTINEL)
- **Goal:** Inspect implementation for bugs, edge cases, and performance leaks.
- **Output:** A detailed audit report and immediate fixes for any identified risks.

### 🛡️ 5. Security Hardening (SECURITY-SENTRY)
- **Goal:** Test for vulnerabilities and verify data protection (RBAC).
- **Output:** Security certification and any required hardening of API routes.

### ⚖️ 6. Final Certification (GUARDIAN-QA)
- **Goal:** Final linting, type-checking, and comprehensive testing.
- **Output:** Final "Ready for Deployment" sign-off.

### 💂 7. Deep Operation Report (ORCHESTRATOR)
- **Goal:** Provide a comprehensive summary of every agent's contribution and the final state of the project.

---

## Technical Stack & Standards

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** Prisma (PostgreSQL)
- **Styling:** Tailwind CSS (Primary) / Vanilla CSS (Only for complex animations)
- **Animations:** Framer Motion
- **Architecture:** Surgical updates, explicit composition, and rigorous type safety.
- **Testing:** Comprehensive unit and integration tests for every change.
