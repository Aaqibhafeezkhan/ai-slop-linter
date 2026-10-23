# Harbor 2.4 release notes

Harbor 2.4 came out on 3 March 2026. Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so everyone on a team shares the same cache. Windows ARM64 is supported for the first time.

We also removed the old `harbor push --legacy` flag. That should simplify your workflow, and we expect it to cut down on failed deploys.

You don't need any setup or config to get these changes.
