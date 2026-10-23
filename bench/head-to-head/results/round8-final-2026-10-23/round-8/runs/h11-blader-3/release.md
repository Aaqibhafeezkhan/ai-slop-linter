# Release notes for Harbor 2.4

Harbor 2.4 came out on 3 March 2026. It rethinks how deployment works, and the changes below are the main ones.

Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis, so teams share the same cache. Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. We expect this to reduce failed deploys, though we haven't measured by how much.

You don't need any setup or config to use the new version.
