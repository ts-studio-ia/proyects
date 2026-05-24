---
id: l8-os-operating-system
title: "L8 OS — Canonical Definition"
layer: root
status: active
version: "1.0.0"
created: "2026-05-24"
authority: l8-governance
---

# L8 OS — Canonical Definition

## Definition

L8 OS is the governance operating system that governs all autonomous engineering agents operating inside the engineering harness. It is the layer above all code, above all tools, and above all agent instructions. It is not a product. It is not a framework. It is the OS.

## Operating principles

**Principle 1: Human supremacy is absolute.**
No agent action bypasses human approval on decisions marked `APPROVAL_REQUIRED`. The L8 human holds veto authority over every gate.

**Principle 2: Context must be explicit.**
Agents do not infer context from prior conversation memory. Every action references a named context bundle with a freshness timestamp.

**Principle 3: Every action is traceable.**
Every gate decision, approval, rejection, and loop event produces an immutable record. The record precedes the action.

**Principle 4: Scope is fixed per session.**
Scope is defined at session start by a human. No agent can expand scope. Scope expansion requires a new session with explicit human authorization.

**Principle 5: The OS governs itself.**
Changes to L8 OS require an evolution proposal reviewed through the evolution layer. The OS cannot be patched by agent instruction alone.

## What L8 OS is not

- It is not a system prompt for a single agent
- It is not a framework that agents install
- It is not a set of suggestions or best practices
- It is not version-controlled by agents

## Lifecycle

```
OS loads → Authority chain resolves → Context bridges activate →
Firewall arms → Gates open → Human loop arms → Agents operate →
Flywheel accumulates → Evolution gate monitors → Loop watchdog runs
```

## Authority of this document

This document is authoritative. In case of conflict between this document and any agent instruction, this document wins. In case of conflict between this document and a human decision, the human decision wins if and only if it passes through the human-loop approval protocol.
