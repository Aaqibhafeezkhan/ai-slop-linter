---
title: Lantern Sync 3.8.0 release notes
date: 2026-09-14
---

# Lantern Sync 3.8.0

Lantern Sync 3.8.0 makes large uploads faster and changes what happens when two devices edit the same file.

## What changed

- **Faster uploads:** Files over 1 GiB upload up to 40% faster. The default chunk size grows from 8 MiB to 16 MiB.
- **Conflict handling:** The new `conflict_policy` setting controls what happens when two devices edit the same file. It defaults to `keep-both`.
- **Bug fix:** The watcher could stall on network drives. That's fixed (#1482).

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

Lantern Sync 3.8.0 requires macOS 12 or later. Windows and Linux builds are unchanged. Full docs are at [the 3.8 docs](https://example.com/lantern/docs/3.8).
