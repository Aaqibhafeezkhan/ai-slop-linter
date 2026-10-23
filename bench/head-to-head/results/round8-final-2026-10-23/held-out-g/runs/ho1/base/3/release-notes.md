---
title: Lantern Sync 3.8.0 release notes
date: 2026-09-14
---

# Lantern Sync 3.8.0

Lantern Sync 3.8.0 makes large uploads faster and gives you control over what happens when two devices edit the same file.

## What changed

- **Faster uploads:** Files over 1 GiB now upload up to 40% faster, thanks to a new chunking strategy. The default chunk size goes from 8 MiB to 16 MiB.
- **Conflict handling:** A new `conflict_policy` setting decides what happens when two devices edit the same file. It defaults to `keep-both`.
- **Watcher fix:** The watcher could stall on network drives. That's fixed (#1482).

One early tester put it this way:

> "It's not just a sync tool, it's a game-changer."

## Configuration

Add this to `lantern.toml`:

```toml
[sync]
chunk_size = "16MiB"
conflict_policy = "keep-both"
```

## Upgrade notes

Lantern Sync 3.8.0 requires macOS 12 or later. Windows and Linux builds are unchanged. Full docs are in [the 3.8 docs](https://example.com/lantern/docs/3.8).
