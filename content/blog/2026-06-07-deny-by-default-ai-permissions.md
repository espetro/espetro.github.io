---
title: "Why AI Agents Need Deny-by-Default Permissions"
date: 2026-06-08
tags:
  - ai-agents
  - security
  - permission-systems
  - ux-design
  - clar
description: "As AI agents start handling sensitive data (your emails, files, finances), it's time the industry stops relying on prompt engineering and adopts deny-by-default permission systems that put users in control."
---

I've been doing Agentic Engineering for over a year and I've also built 10+ AI integrations and AI-native apps for customers, and the #1 thing that strikes me the most is how increasingly powerful agents are getting while there's little thought given to safety infrastructure. 
Most coding agents come with _YOLO_ mode which can even [destroy your DB](https://x.com/lifeof_jer/status/2048103471019434248), and only now we're seeing more nuanced options like Claude's [Auto Mode](https://claude.com/blog/auto-mode); a step forward, though still binary: the agent either has full autonomy or it doesn't.

For context, I've been building [clar](https://clar.illo.fyi/), an agentic tool that brings email data to your AI without compromises.

## The Problem with "Allow Everything"

Current AI tooling either asks for full access upfront, or operates in a vague gray zone where permission scopes are implied but never enforced. You either grant full access to your Gmail, or you can't use the agent. There's no middle ground; no way to say "read my emails, but never send anything".

This isn't a UX problem, but a trust issue, and trust problems kill adoption. When non-technical users hear "AI agent with access to your email," they can't help it but picture all the wrong things that could happen before even considering the wins. And that's a reasonable fear; the current tooling does little to address it.

## Deny-by-Default: The Pattern Emerging in Infrastructure

A new wave of tooling is proving there's a better way: projects like [OpenShell](https://github.com/NVIDIA/OpenShell) and [nono sandbox](https://github.com/nono-platform/nono) are demonstrating what happens when you flip the default; instead of granting broad access and hoping for the best, you start from **zero** and require explicit, audited permission for every sensitive operation.

This isn't just security theater. It's a fundamentally different UX philosophy:

- **Explicit over implicit**: The agent must ask, and you must answer.
- **Auditable over assumed**: Every permission granted is logged. You can review what you allowed.
- **Adjustable over static**: As your comfort grows (or shrinks), you recalibrate. The agent adapts.

OpenShell's approach is particularly elegant: it's a sandboxed runtime that denies all network egress by default and requires explicit policy rules for every outbound connection the agent makes. Nono takes a similar stance with a developer-friendly sandbox that makes permission-granting explicit rather than magical.

## Why This Democratizes AI Agents

Here's the insight most people miss: strict permissions don't limit who can use AI agents. They **enable** broader adoption.

A non-technical user who doesn't understand OAuth scopes will still understand "This tool wants to read your emails. Should it?" paired with clear context about what that means. Permission dialogs, when done right, are **education**.

And for power users? Deny-by-default gives them the confidence to allow more, faster. They're not guessing whether the tool is being honest about what it accesses—they know, because the system showed them.

The result: AI agents become usable by everyone, not just the people who feel comfortable reading source code.

## What This Looks Like in Practice

At clar, I'm building around this exact principle. When the agent needs to read your inbox, it asks. When it needs to send an email, it asks again (and shows you exactly what it's about to send before touching anything). When it needs to access your calendar, that permission is separate, auditable, and revocable at any time.

The default state is locked. Progress is earned through explicit consent.

I'm also establishing an open-source foundation for clar. There's no better trust mechanism than auditable source. If you want to verify what we're actually doing with your data, you can. No NDAs required.

## From Blind Faith to Safety-First UX

The AI agent space is at an inflection point. We can keep building tools that require blind trust, or we can build tools that earn trust through transparent, user-controlled permission systems.

Deny-by-default isn't a limitation. It's the feature that makes AI agents viable for everyone; not just the technically sophisticated, not just the fearless, but your mom, your coworker, your client who has never read a privacy policy in their life.

The era of blindly granting access is ending. Safety-first UX is what's replacing it. And honestly? It's overdue.

---

*Building in public. Follow along at [clar.illo.fyi](https://clar.illo.fyi/): open-source, permission-aware email AI.*
