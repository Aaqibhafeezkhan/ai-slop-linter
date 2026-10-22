# Release notes for Harbor 2.4

Harbor 2.4 came out on 3 March 2026. Builds are faster, the cache has moved, and Windows ARM64 now works.

Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so teams share the same cached results. Windows ARM64 is supported for the first time.

We removed the old `harbor push --legacy` flag. That should cut down on failed deploys, though we haven't measured by how much.

You don't need any setup or config changes to get the new build times.
