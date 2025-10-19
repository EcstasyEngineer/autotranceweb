# Tools for Emitting TidalCycles‑Like Syntax to WebSocket

This note collects practical options for streaming Tidal‑style patterns over WebSockets (or adjacent protocols) so a client/server can exchange musical patterns and/or evaluated events.

## 1) tidal‑websocket (Haskell server)
- A small Haskell server by Alex McLean that embeds Tidal and exposes a WebSocket API.
- Endpoints include `/play` (evaluate/perform code) and `/eval` (return pattern events for spans as JSON). Tempo control, tick/bang messages, and `/record` exist in the prototype.
- Status: pre‑Tidal‑1.0; may need minor fixes to run with current Tidal.
- Fit: quickest off‑the‑shelf bridge if you want “real Tidal” and a WS API. Client can be Python/JS.

## 2) Strudel (Tidal in JavaScript)
- Strudel is a JS port of Tidal’s pattern language (runs in browser or Node). Uses Web Audio for sound, and supports OSC/MQTT output.
- You can adapt Strudel’s event/scheduler layer to push pattern events to a WebSocket (or forward via MQTT over WebSockets).
- Fit: best if you want a PWA/JS stack and avoid Haskell. Lets you evaluate patterns client‑side while still exporting events.

## 3) Collaborative systems
- Extramuros / Estuary / Troop use sockets (often WebSockets) to share code and inject it into a Tidal backend. Heavier than needed for single‑user control, but confirm that networked Tidal is feasible.

### Recommendation
- For a browser‑first MVP: use Strudel in the client and (optionally) forward events to WS for telemetry/sync.
- For a server‑rendering mode later: consider reviving `tidal‑websocket` behind a feature flag.
