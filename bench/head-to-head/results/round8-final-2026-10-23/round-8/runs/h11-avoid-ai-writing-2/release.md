# Release Notes For Harbor 2.4

Here's a quick overview of what changed in Harbor 2.4, which was released on 3 March 2026.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis.
- **Support:** Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. That could reduce the number of failed deploys.
