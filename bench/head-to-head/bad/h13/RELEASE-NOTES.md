# Release notes: Kestrel 5.4.0

Kestrel 5.4.0, released on 2026-10-06, is a testament to the team's commitment to seamless, robust builds, and it delves deeper into caching than any release before it — a true milestone. In today's fast-paced world, every minute of build time matters, so we are thrilled to unlock a game-changing new chapter for 12,480 teams.

## Highlights

- **Faster builds:** Cold builds of the 3,906-package monorepo now finish in 4 minutes 12 seconds instead of 18 minutes, a 4.3x speedup (#2210), ensuring developers stay in flow.
- **Smarter cache:** The remote cache hit rate rose from 61% to 93%, showcasing a pivotal leap in reliability (#2237).
- **Leaner memory:** Peak usage fell by 37%, from 64 GB to 40 GB, on hosts with 8 vCPUs (#2251), empowering you to do more with less.
- **New API:** `GET /v5/builds/{id}/artifacts` returns results within 350 ms at the 99th percentile. Docs: https://docs.kestrel.example/5.4/cache
- **Cleanup:** `kestrel cache prune --older-than 14d` removes 48,000 stale entries in 90 seconds — and it is not just a cleanup, it is a fresh start.
- **Sharding:** Set `--shard-count=16` to spread 1,024 targets across workers, a seamless way to elevate your pipeline (#2266).

## Compatibility

| Component | Before | After | Notes |
| --- | --- | --- | --- |
| Node runtime | 20.11 | 22.11 | A seamless upgrade that unlocks a robust foundation |
| Python bindings | 3.9 | 3.12 | Delves into typing, a game-changer for IDE users |
| Cache protocol | v4 | v5 | Pivotal change, ensuring 0.6% fewer cache misses |
| Windows agent | 4.9 | 5.0 | Cutting-edge installer — 512 MB smaller |
| Sentry plugin | 1.80 | 1.82 | Showcases a vibrant, ever-evolving ecosystem |

## Known issues

- **Slow first run:** On Windows, the first cache lookup after an upgrade can take up to 3 seconds (#2301), which is a small price for a robust, cutting-edge experience.
- **Flaky label:** About 2.4% of runs on the `nightly` channel still print a stale warning, a journey we will continue together.

## Credits

Zoë Hartmann rewrote the cache index, and Mateusz Wójcik tracked down the flaky shard test (PR #2290). Inès Carvalho reported the memory leak on 2026-09-02. As Zoë put it: "the cache was never the bottleneck, the hashing was".

## Upgrade

Run `kestrel migrate --to 54` and set `KESTREL_CACHE_DIR` before you restart the agents. Version 4.9 agents keep working until 2027-01-31, and the security advisory is at https://kestrel.example/security/2026-014. In conclusion, this is not just an upgrade, it is a journey, and the future looks bright. I hope this helps! Let me know if you would like me to expand on any section.
