# Release Notes for Harbor 2.4

Harbor 2.4 came out on 3 March 2026. Here's what changed.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis, so teams share the same cache.
- **Support:** Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag is gone. Removing it should cut down on failed deploys.

There's no setup or config needed to get any of this.
