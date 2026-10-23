# Harbor 2.4 release notes

Harbor 2.4 came out on 3 March 2026. It changes how teams ship, mostly by making builds faster and the cache shared.

Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so everyone on a team uses the same one. Windows ARM64 is supported for the first time.

We removed the old `harbor push --legacy` flag. That should cut down on failed deploys, since there is one less way to push the wrong thing.

You don't need any setup or config to get these changes.
