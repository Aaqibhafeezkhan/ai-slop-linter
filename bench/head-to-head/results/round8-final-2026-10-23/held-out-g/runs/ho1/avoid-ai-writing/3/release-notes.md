---
title: Lantern Sync 3.8.0 release notes
date: 2026-09-14
---

# Lantern Sync 3.8.0

## What changed

Lantern Sync 3.8.0 makes large uploads faster and adds a setting for how sync conflicts are handled.

- **Faster uploads:** Uploads of files over 1 GiB are now up to 40% faster, thanks to a new chunking strategy. The default chunk size grows from 8 MiB to 16 MiB.
- **Smarter conflict handling:** The new `conflict_policy` setting decides what happens when two devices edit the same file. It defaults to `keep-both`.
- **Fixed a bug:** We fixed an issue where the watcher could stall on network drives (#1482).

One early tester put it this way:

> "It's not just a sync tool, it's a game-changer."

## Configuration

Add the following to `lantern.toml`:

```toml
[sync]
chunk_size = "16MiB"
conflict_policy = "keep-both"
```

## Upgrade notes

Lantern Sync 3.8.0 requires macOS 12 or later. Windows and Linux builds are unchanged. See [the 3.8 docs](https://example.com/lantern/docs/3.8) for the full documentation.
