---
title: Lantern Sync 3.8.0 release notes
date: 2026-09-14
---

# Lantern Sync 3.8.0

This release speeds up uploads of large files and gives you control over what happens when two devices edit the same file.

## What changed

Files over 1 GiB now upload up to 40% faster with the new chunking strategy. The default chunk size grows from 8 MiB to 16 MiB.

The new `conflict_policy` setting decides what happens when two devices edit the same file. It defaults to `keep-both`.

The watcher could stall on network drives. That is fixed (#1482).

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

Lantern Sync 3.8.0 requires macOS 12 or later. Windows and Linux builds are unchanged. The full docs are in the [Lantern Sync 3.8 documentation](https://example.com/lantern/docs/3.8).
