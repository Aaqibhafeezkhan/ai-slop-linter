# Release notes for Harbor 2.4

Harbor 2.4 was released on 3 March 2026 and changes how teams ship.

- Builds now finish in 41 seconds instead of 95.
- The cache moved from disk to Redis, so teams stay aligned.
- Windows ARM64 is supported for the first time.

The old `harbor push --legacy` flag was removed. That should streamline workflows and leave developers more time for other work, and it may reduce the number of failed deploys across many teams and organizations.

It needs no setup and no config.
