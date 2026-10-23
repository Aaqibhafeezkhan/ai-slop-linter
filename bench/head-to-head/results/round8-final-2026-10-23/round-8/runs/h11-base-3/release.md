# Harbor 2.4 release notes

Harbor 2.4 came out on 3 March 2026. Here's what changed.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis.
- **Support:** Windows ARM64 is supported for the first time.

We also removed the old `harbor push --legacy` flag. That should cut down on failed deploys.

There's no new setup or config needed to get any of this.
