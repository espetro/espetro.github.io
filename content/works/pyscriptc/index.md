---
name: pyscriptc
summary: Compile annotated Python to native binaries. Typed subset, opt-in CPython fallback.
status: building
scale: tool
since: 2026-10-14
primary: { label: Docs, url: https://pyscriptc.pages.dev }
repo: sigilco/pyscriptc
labels: { surface: cli, runtime: local-first, source: open }
stack: [Python, LLVM, C]
highlight:
  order: 1
  proof: v0.8.0 on PyPI with Linux, macOS and Windows compiler binaries.
cover: ./cover.webp
---

Compile annotated Python to native binaries. A typed subset lowers through IR to LLVM, and code outside the subset can opt in to a CPython island instead of failing.
