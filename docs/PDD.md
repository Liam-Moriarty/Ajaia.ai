<!-- Product Design Document (PDD) -->

# Product Design Document

## Overview

A lightweight, Google Docs-inspired collaborative document editor: users create and edit rich-text documents in the browser, import plain text/Markdown files as new documents, and share documents with other users.

## Problem Statement

This is a timed (4-6 hour) take-home assessment for Ajaia's Full Stack Product Engineer role (full brief in `context/assessment.md`). Ajaia is exploring internal productivity tools that help teams move faster on shared work; the exercise simulates being asked to ship the strongest working slice of a collaborative doc editor within a tight timebox, demonstrating product judgment and full-stack execution rather than feature completeness.

## Target Users / Personas

- **Primary**: an individual user creating, editing, and organizing their own documents.
- **Secondary**: a collaborator a document owner has explicitly granted access to.
- Reviewer context: Ajaia evaluators will sign up their own test accounts (or use seeded ones) to exercise both roles.

## Goals

- A usable, coherent rich-text editing experience (not feature parity with Google Docs).
- Working file import that turns a `.txt`/`.md` file into a new editable document.
- A simple, correct owner/shared-access sharing model with a visible distinction between owned and shared documents.
- Documents and sharing persist across page refresh.
- Ship within the 4-6 hour timebox with clearly stated, deliberate scope cuts.

## Non-Goals

- Real-time multi-cursor collaboration.
- Fine-grained roles/permissions (view-only vs. edit tiers).
- `.docx` import.
- Enterprise-grade access control, comments/suggestion mode, version history, PDF export (all listed as optional stretch only, not committed scope).

## User Stories / Use Cases

- As a user, I want to create a new document and start typing, so that I can capture an idea immediately.
- As a user, I want to apply bold/italic/underline/headings/lists, so that my document is readable and structured.
- As a user, I want to rename a document, so that I can find it later.
- As a user, I want to upload a `.txt` or `.md` file, so that existing content becomes an editable document without retyping it.
- As a user, I want to share a document with a teammate by their email, so that they can view and edit it too.
- As a user, I want to see which documents are mine versus shared with me, so that I understand ownership at a glance.
- As a user, I want my edits saved automatically, so that I never lose work or have to remember to hit save.

## Requirements

### Functional Requirements

- Create, rename, edit, save, and reopen documents.
- Rich-text formatting: bold, italic, underline, headings (multiple levels), bulleted and numbered lists.
- Import a `.txt` or `.md` file as a new document; reject other file types with a clear message.
- Email/password sign-up and sign-in.
- Share a document with another registered user by email; shared documents are visibly distinguished from owned ones on the document list.
- Documents and share grants persist and are correctly scoped per user after refresh/re-login.

### Non-Functional Requirements

- No paid dependencies or services required for a reviewer to run/test the product.
- Basic input validation and error handling (invalid email, unsupported file type, failed save/share).
- At least one automated test on the highest-risk hand-written logic.
- Access control enforced at the data layer (not just hidden in the UI).
- Deployed to a live URL reviewers can open directly.

## Success Metrics

- A reviewer can, without help: sign up, create a document, format text, rename it, import a file as a new document, share a document with a second account, and see it appear correctly on both accounts after refresh.
- The architecture note and AI workflow note clearly communicate what was prioritized, what was cut, and why.

## Open Questions

- None outstanding — open items were resolved during design (see `docs/TDD.md` for the resulting technical decisions and stated scope cuts).
