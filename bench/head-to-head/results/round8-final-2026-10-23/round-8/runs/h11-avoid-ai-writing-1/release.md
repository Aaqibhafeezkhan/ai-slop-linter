# Release notes for Harbor 2.4

Harbor 2.4 came out on 3 March 2026. Here's what changed.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis.
- **Support:** Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. That change might reduce the number of failed deploys.

Harbor 2.4 needs no setup or config.
