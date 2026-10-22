# Harbor 2.4 release notes

Harbor 2.4 came out on 3 March 2026. Here is a list of what changed in this release.

- Builds now finish in 41 seconds instead of 95.
- The cache moved from disk to Redis, so teams share one cache.
- Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. Some people expect this change to reduce the number of failed deploys for many teams, though the notes give no figure for that. Harbor needs no setup and no config.
