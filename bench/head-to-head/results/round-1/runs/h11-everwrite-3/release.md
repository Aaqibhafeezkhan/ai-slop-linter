# Release Notes For Harbor 2.4

Harbor 2.4 came out on 3 March 2026. Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis. Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag is gone. If a script of yours still passes it, drop the flag before upgrading.
