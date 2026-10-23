---
title: Lantern Sync 3.8.0 release notes
date: 2026-09-14
---

# Lantern Sync 3.8.0

Certainly! Here is a comprehensive overview of the release notes for Lantern Sync 3.8.0. I hope this helps, and let me know if you would like any changes.

## What changed

We are thrilled to announce Lantern Sync 3.8.0 — a game-changing release that seamlessly transforms how your team syncs files. In today's fast-paced world, reliable sync is more important than ever.

- **Faster uploads:** Uploads of files over 1 GiB are now up to 40% faster, thanks to a robust new chunking strategy. The default chunk size grows from 8 MiB to 16 MiB.
- **Smarter conflict handling:** It's worth noting that conflicts are now resolved intelligently. The new `conflict_policy` setting plays a crucial role in deciding what happens when two devices edit the same file, and it defaults to `keep-both`.
- **Fixed a bug:** We fixed a potential issue where the watcher could possibly stall on network drives (#1482).

One early tester put it this way:

> "It's not just a sync tool, it's a game-changer."

## Configuration

To get started, simply add the following to `lantern.toml`:

```toml
[sync]
chunk_size = "16MiB"
conflict_policy = "keep-both"
```

## Upgrade notes

Lantern Sync 3.8.0 requires macOS 12 or later. Windows and Linux builds are unchanged. Overall, this update represents a significant step forward, and we look forward to your feedback. Full docs are available at [the 3.8 docs](https://example.com/lantern/docs/3.8) — happy syncing!
