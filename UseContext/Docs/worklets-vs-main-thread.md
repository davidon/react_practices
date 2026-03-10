# Worklets vs Main Thread

## Main Thread

The single thread where the browser runs **all** your normal JavaScript, DOM updates, event handlers, React rendering, etc. Everything in `LoginContext.jsx` runs on the main thread.

## Worklet

A **lightweight, restricted JavaScript execution environment** that runs **off the main thread** (or in a sandboxed context). Worklets are designed for specific, narrow tasks where the browser needs to run your code in its internal pipeline.

| Feature | Main Thread | Worklet |
|---|---|---|
| **DOM access** | ✅ Yes | ❌ No |
| **Full JS APIs** | ✅ Yes | ❌ Limited subset |
| **Purpose** | General app logic | Specific browser pipeline hooks |
| **Lifecycle** | You control it | Browser controls it |
| **`fetch`, `XMLHttpRequest`** | ✅ Yes | ❌ No |

## Types of Worklets

| Worklet | What it does | Example |
|---|---|---|
| **Paint Worklet** | Custom CSS painting | `CSS.paintWorklet.addModule('circles.js')` |
| **Audio Worklet** | Real-time audio processing | Custom synthesizers, effects |
| **Animation Worklet** | Scroll-linked animations off main thread | Parallax without jank |
| **Layout Worklet** | Custom CSS layout algorithms | (Experimental) |
| **Shared Storage Worklet** | Reads cross-site Shared Storage data | Privacy Sandbox |

## Why Shared Storage Uses a Worklet

The browser **intentionally** prevents you from reading Shared Storage data on the main thread. If you could, you'd be able to exfiltrate cross-site data. The worklet can only **select a URL** or **send an aggregated report** — never leak raw values to your page JS.

```javascript
// Main thread — can WRITE but NOT READ
await window.sharedStorage.set('ab-group', 'experiment');

// Worklet — can READ, but can only output a constrained result
// (e.g., pick an index from a list of URLs)
class MyOperation extends SharedStorageWorkletOperation {
  async run(urls) {
    const group = await this.sharedStorage.get('ab-group');
    return group === 'experiment' ? 1 : 0; // index into urls array
  }
}
```

## Who Does What

| Step | Who | What |
|---|---|---|
| Write the worklet JS file | **You** | Define the class and logic |
| Call `addModule()` / register | **You** (main thread) | Tell the browser to load it |
| Create the sandboxed environment | **Browser** | Sets up the restricted context |
| Call your worklet methods | **Browser** | Invokes at the right pipeline stage |
| Decide **when** to run it | **Browser** | During paint/audio/layout cycle |

You write the code, the browser decides **when and where** to run it — in a sandboxed, restricted context with no DOM access, no `fetch`, no `postMessage`. You're essentially writing a **plugin** for the browser's internals.

## Worklets vs Web Workers / Service Workers

Worklets are **not** the same as Workers:

| | Worker | Worklet |
|---|---|---|
| **Weight** | Heavyweight, own event loop | Lightweight, minimal |
| **Messaging** | `postMessage` back and forth | No messaging — browser calls you |
| **Lifetime** | You create/destroy | Browser manages |
| **Use case** | Heavy computation, background tasks | Hook into browser internals |

