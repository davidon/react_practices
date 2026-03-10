# Chrome & Third-Party Cookies — Current Status (2025)

## Does Chrome Have Third-Party Cookies?

**Yes — Chrome still has third-party cookies** (as of mid-2025). Google **reversed** its plan to fully remove them.

## Timeline

| Date | What happened |
|---|---|
| 2020 | Google announced plan to phase out 3rd-party cookies |
| 2024 Jan | Started 1% test (Tracking Protection) |
| 2024 Jul | **Reversed course** — announced they would NOT remove them entirely |
| 2025 Apr | Announced a **new prompt-based approach** — users choose via a setting |
| Now | 3rd-party cookies **still work by default** in Chrome |

## Browser Comparison

| Browser | 3rd-party cookies |
|---|---|
| **Safari** | Blocked by default (since 2020, ITP) |
| **Firefox** | Blocked by default (since 2019, ETP) |
| **Chrome** | ✅ Still allowed by default (user choice coming) |
| **Brave** | Blocked by default |

## What Actually Happened

Instead of removing them, Chrome is giving users an **informed choice** (similar to what Safari/Firefox already do with blocking by default). The Privacy Sandbox APIs (like Shared Storage, Topics, Attribution Reporting) were built as **replacements** in case cookies were removed — they still exist but are less urgent now.

## Relevance to This Project

None. `sessionStorage` and `localStorage` are **same-origin, first-party storage** and have nothing to do with third-party cookies.

