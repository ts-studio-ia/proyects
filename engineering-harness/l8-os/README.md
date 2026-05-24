---
id: l8-os-readme
title: "L8 OS — Engineering Harness Operating System"
layer: root
status: active
version: "1.0.0"
created: "2026-05-24"
authority: l8-governance
---

# L8 OS — Engineering Harness Operating System

## What this is

L8 OS is the governance operating system for autonomous engineering agents. It defines the canonical layers, contracts, authorities, and protocols that every agent, tool, and human must follow when operating inside the engineering harness.

This is not documentation. It is the operating system. Agents read it before acting. Humans read it before approving. No action is taken outside of the contracts defined here.

## Why it exists

Autonomous agents without a governance operating system produce drift: semantic drift, scope drift, authority drift, and loop conditions. L8 OS provides the invariant contracts that prevent drift and ensure every action is traceable, approvable, and reversible.

## The 9 canonical layers

| Layer | Directory | Responsibility |
|---|---|---|
| 1 | `context-communication-layer/` | Moves context safely between agents and humans |
| 2 | `human-loop/` | Ensures human authority at every critical decision |
| 3 | `cognitive-interpretation/` | Translates human intent into technical plans |
| 4 | `validation-gate/` | Gates execution behind approval packages |
| 5 | `semantic-firewall/` | Blocks prompt injection and scope violations |
| 6 | `l8-governance/` | Authority chain and role definitions |
| 7 | `context-flywheel/` | Accumulates and promotes organizational knowledge |
| 8 | `evolution/` | Governs how the OS itself can change |
| 9 | `loop-prevention/` | Detects and breaks infinite action loops |

## Root files

- `OPERATING_SYSTEM.md` — canonical definition of what L8 OS is
- `VOCABULARY.md` — authoritative glossary for all terms used in this OS
- `AUTHORITY_CHAIN.md` — who can authorize what, and in what order
- `NON_NEGOTIABLES.md` — invariants that cannot be overridden by any layer

## Usage

Agents: load `OPERATING_SYSTEM.md` and `AUTHORITY_CHAIN.md` before every session.
Humans: consult `NON_NEGOTIABLES.md` before approving any evolution proposal.
Layer owners: your layer's `README.md` is the contract for your layer.
