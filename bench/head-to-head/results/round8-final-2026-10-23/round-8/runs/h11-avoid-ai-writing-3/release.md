# Release Notes For Harbor 2.4

Here's a quick overview of what changed in Harbor 2.4.

Harbor 2.4 came out on 3 March 2026. It's a complete rethink of how teams ship, and it reflects our commitment to smooth, reliable tooling.

- **Speed:** Builds now finish in 41 seconds instead of 95.
- **Caching:** The cache moved from disk to Redis, so teams stay aligned.
- **Support:** Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. Experts argue that this change will simplify workflows and let developers do more meaningful work, and that it could meaningfully reduce failed deploys across many teams.

It needs no setup and no config.
