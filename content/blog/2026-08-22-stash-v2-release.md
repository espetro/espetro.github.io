---
title: "Stash v2 is out: why your browser tabs need an AI-first workflow"
date: 2026-08-22
tags:
  - stash
  - chrome-extensions
  - mcp
  - local-first
  - agentic-workflow
description: "Stash v2 turns a tab-sharing extension into a local AI-first session manager. Why browser extensions are quietly becoming one of the most important surfaces for AI agents, and how MCP + local-first actually fit together."
---

For a long time I treated "browser extension" as a small, contained thing. A popup. A right-click menu. A little island of JavaScript that pokes at `chrome.tabs` and gets out of the way. Useful, sure, but not where the interesting work happens.

Then I started building agents. And the more agents I built, the more I kept coming back to the same place: **the browser is the most important surface in a person's day**. Email lives there. Docs live there. Half your job is reading something in a tab. If your agent can't see the browser, it's working with a stale snapshot of reality at best.

That's the bet behind Stash v2. It's not really "a tab sharing tool with more buttons" any more. It's a small, local AI-first session manager that happens to be a browser extension.

## What's actually new in v2

If you used Stash before, you remember it as a one-shot: pick some tabs, get a link, send the link, done. v2 keeps that flow but adds a whole other mode: **saving sessions locally**, with titles, tags, and notes, and a UI to come back to them. And then on top of that, **an MCP server running inside the extension itself**, so AI agents can read your tabs, search your stashes, and create new ones, all without anything ever leaving your machine.

Concretely:

- A local **stash library** in the extension's `storage.local`, with My Stashes UI in both the popup and the viewer
- A **local MCP server** with eight tools: snapshot tabs, list/get/create/update/delete/search stashes, decode a payload
- An **opt-in short link service** for when you actually want a tiny URL (5/min rate limit, 7-day TTL ceiling, server-side)
- **Payload v6** with optional top-level `tags` and `note`; v4/v5 still decode fine
- Anonymous aggregate telemetry only (no tab URLs, no titles, no identifiers)

The reason I care about each of those is the same reason: they make the browser legible to an agent without making it surveilled.

## Why extensions are the right surface for AI agents

There are a few places you could put an agent's "view of your computer". The OS. A desktop app. A web app. Each has trade-offs, but extensions have something the others don't, which is that they already live **inside the context the user is actively thinking about**.

When I open a bunch of tabs comparing tools, I'm mid-thought. I want an agent that can take a snapshot of what I'm looking at and either come back later with analysis, or stash it for tomorrow me, or pass it to another agent that's good at the comparison. None of that needs a server. None of that needs my email. None of that needs a subscription.

But a Chrome extension talking to a hosted agent backend is, of course, exactly the surveillance business model that made us hate the last decade of extensions. So the architecture question isn't "should agents see your tabs?" It's **"how do you let them see your tabs without the architecture itself becoming the leak?"**

The answer Stash lands on is a combination of two ideas that have been slowly winning everywhere else: **MCP** as the protocol, and **local-first** as the default storage model.

## The MCP half

MCP (Model Context Protocol) gets criticised a lot for being over-hyped. Some of that is fair. But the thing it actually solves well is the boring one: when an agent wants to call a tool, who decides what the input shape is, who serialises it, who handles errors, how does the agent discover what tools exist? Before MCP every framework had its own answer and none of them talked to each other.

In Stash, the local MCP server runs over a Chrome runtime port named `stash-mcp`. An MCP-compatible client on the same machine (Claude, Cursor, whatever) just connects, gets the tool list, and starts calling. The eight tools are dead simple:

- `stash_snapshot_tabs` — give me what's open right now
- `stash_list` / `stash_get` / `stash_search` — read the library
- `stash_create` / `stash_update` / `stash_delete` — write to the library
- `stash_decode` — turn a share payload into structured data

That's it. No plugins. No DSL. No schema migration framework. The agent already knows what `stash_search` does because MCP gave it the description and the input schema at handshake time.

The hosted shortener worker exposes a smaller surface (`stash_create`, `stash_get`, `stash_decode`), aimed at agents that don't have access to your machine but do have access to the shortener URL. Same protocol, different scope. That's the part of MCP I underrated: the same agent code can talk to both because the protocol doesn't care where the tool runs.

## The local-first half

Local-first is the boring older sibling of MCP and it solves the harder problem: **where the data lives**. In Stash's case, your stashes live in `browser.storage.local`. The extension's manifest declares no host permissions for anything beyond the shortener origin you opt into. There is no cloud copy of your library, no sync daemon, no "your data lives in 47 regions".

The tradeoff is obvious: if you clear browser data without exporting, your library is gone. So v2 has a real Export/Import flow (full library as JSON, in the viewer). And the design contract is: the export button is never more than two clicks away, and the import never silently merges.

What's less obvious is what this buys you at the agent layer. When `stash_list` returns your stashes, the agent is reading from your disk, not from a service that might be down, rate-limiting you, charging per request, or mining your tab titles. The trust model collapses to: **do you trust the extension running on your machine?** That's a one-hop trust model instead of a "trust us, our subprocessors are great" one.

And there's a follow-on effect I didn't expect: local-first makes the AI features feel less like features and more like **a really good text editor on top of your files**. When the agent can search my library and the library is just a folder, it stops feeling like the agent "knows me" and starts feeling like the agent "can read".

## The non-obvious parts

A few things I had to learn the hard way and want to share:

**The encoder/decoder will silently desync if you let it.** Stash v5 and v6 both encode to the same URL format. When we were developing v6 locally, the extension was happily emitting v6 payloads and the deployed viewer was throwing "Unsupported payload version" because it only knew about v4/v5. Lesson: any codec change needs a regression test asserting `decodeShareUrl(encodePayloadToUrl(x)).version === PAYLOAD_VERSION`, full stop. We have that test now and it would have saved me an afternoon.

**Rate limits need to fail closed.** The shortener uses the Workers rate limit binding, but if the binding is missing (dev environment, deploy misconfig) the path of least resistance is to log a warning and let the request through. Don't do that. A missing rate limit is worse than a 503 because the failure mode is "we serve traffic we never should have", which you only notice when the bill arrives.

**Telemetry privacy is a copy problem as much as a code problem.** The Analytics Engine writes route/clientClass/ttlBucket/origin/status, nothing else. That's fine. But the privacy page has to actually explain that in plain English or nobody will believe you. "We collect nothing" reads as marketing. "We collect exactly these five fields and you can verify by reading this source file" reads as a fact.

## Pairing MCP with local-first in practice

If you're building something similar, the recipe that worked for me:

1. **Pick a protocol, not a framework.** MCP is fine. So is a plain JSON-over-HTTP API. The point is committing to one and writing your tool definitions once, against the schema, not against a specific SDK.
2. **Keep the local store boring.** `storage.local` for the extension, a folder for the viewer, IndexedDB if you need richer queries. Resist the urge to add an in-process CRDT. You don't have a sync problem yet; you have a "does the user trust it" problem.
3. **Make the hosted surface a strict subset of the local surface.** If the hosted tools can do something the local tools can't, you've accidentally created a feature flag tied to a server. Hosted should be "the bits that genuinely can't be local" (in Stash's case, that's literally just `stash_create` with KV storage and a tiny URL).
4. **Version everything that touches the wire.** Payload format, MCP tool schemas, the rate limit headers, the export JSON. Pin them and add round-trip tests.
5. **Give the agent the same affordances you give the UI.** If a user can rename a stash, the agent should be able to rename a stash. If the user can tag, the agent can tag. The asymmetry is where things get weird.

## Where this goes

I'm not going to pretend I know where browser agents land in five years. But I'm pretty sure of two things. One: the browser will keep being where most of the thinking happens, so the agents that win will be the ones with a browser surface. Two: the ones users actually trust will be the ones whose data model is local-first and whose interface to the model is a small, well-documented protocol rather than a 500-page SDK.

Stash v2 is a small thing. It's a tab manager. But it's also the most honest AI-first extension I've shipped, in the sense that every byte of your tab data lives somewhere you can audit on disk, and every tool the agent calls has a name and a schema you can read in source.

If that sounds like the right shape for your own extension, the docs at [stash.illo.fyi/docs](https://stash.illo.fyi/docs) cover self-hosting the viewer and the shortener worker. The extension is on the Chrome Web Store and Firefox Add-ons. The hosted MCP endpoint is at `s.illo.fyi/mcp` if you want to poke it from an agent.

And if you build something with these pieces, I'd genuinely like to hear about it. The patterns are still shaking out.
