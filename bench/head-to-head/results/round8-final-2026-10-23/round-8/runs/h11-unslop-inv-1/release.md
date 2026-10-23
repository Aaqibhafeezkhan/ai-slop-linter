# Harbor 2.4 release notes

Harbor 2.4 was released on 3 March 2026.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis.
- **Support:** Windows ARM64 is supported for the first time.

## Removed

The `harbor push --legacy` flag is gone. This may reduce failed deploys.

Nothing needs to be set up or configured to get the new build times.
