# Harbor 2.4 release notes

Harbor 2.4 came out on 3 March 2026. Here is what changed.

Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so teams share one cache and stay aligned. Windows ARM64 is supported for the first time.

We also removed the old `harbor push --legacy` flag. We expect that to cut down on failed deploys.
