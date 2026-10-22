# Release Notes For Harbor 2.4

Harbor 2.4 came out on 3 March 2026. Here's what changed.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis, so teams share the same cache.
- **Support:** Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag is gone. Removing it should simplify workflows and may cut down on failed deploys.

You don't need to set up or configure anything to get these changes.
