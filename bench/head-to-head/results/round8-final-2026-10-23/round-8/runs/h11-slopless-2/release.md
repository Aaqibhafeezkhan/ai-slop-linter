# Harbor 2.4 Release Notes

Harbor 2.4 came out on 3 March 2026. Here's what changed.

- **Speed:** Builds now take 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis, so everyone on a team shares the same one.
- **Support:** Windows ARM64 is now supported for the first time.

We removed the old `harbor push --legacy` flag. It should cut down on failed deploys, though we haven't measured by how much.

You don't need any setup or config changes to get these.
