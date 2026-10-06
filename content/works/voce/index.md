---
name: Voce
summary: macOS menubar app that filters calls so only your voice comes through.
status: archived
scale: product
since: 2026-06-07
primary: { label: Source, url: https://github.com/espetro/voce }
repo: espetro/voce
labels: { surface: macos, runtime: on-device, source: open }
stack: [Rust, ONNX, CoreML]
---

Voce is a privacy-first, on-device macOS app that performs real-time speaker identification and voice filtering. It learns your voice during a short enrollment step, then uses that model to pass only your speech and silence everyone else's — no cloud, no latency, no data leaving your machine.

- On-device speaker enrollment and identification
- Real-time audio filtering via virtual audio device (BlackHole)
- CoreML acceleration on Apple Silicon
