# Strudel’s Live Coding Language (Tidal‑style)

Strudel implements the TidalCycles pattern language in JavaScript for browser/Node. It uses Web Audio for sound and mirrors Tidal’s algorithmic pattern ideas.

## Key Features
- Algorithmic patterns: patterns over repeating cycles; combine/transform declaratively.
- Mini‑notation: concise strings for rhythms (subdivisions, polyrhythms, repeats).
- Function chaining: s("bd sd").gain(0.3).fast(2) transforms patterns fluently.
- Live coding: evaluate on the fly; hush/solo; iterative performance.
- Audio integration: sampler/synth params via Web Audio; supports sending via OSC/MQTT.

## Syntax Snapshot
```
note("c a f e")     // cycle of notes
  .s("piano")       // instrument
  .gain(0.5)        // volume
  .every(2, x => x.fast(2)) // transform every 2 cycles
```

## Fit for the MVP
- Runs entirely in the PWA; no server audio required.
- Can emit events to WebSocket or MQTT if we need telemetry/sync.
- Tidal examples map 1:1 conceptually; JS chaining replaces Haskell operators.
