# Release notes for Harbor 2.4

Harbor 2.4 was released on 3 March 2026. It changes how builds, caching, and platform support work.

Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so teams share the same cached data. Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. That may reduce the number of failed deploys. The release needs no setup or config.
