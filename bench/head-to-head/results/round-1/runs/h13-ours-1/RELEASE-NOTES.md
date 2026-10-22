# Release notes: Kestrel 5.4.0

Kestrel 5.4.0 was released on 2026-10-06. It changes caching more than any release before it, and build time is what 12,480 teams feel first.

## Highlights

- Cold builds of the 3,906-package monorepo now finish in 4 minutes 12 seconds instead of 18 minutes, a 4.3x speedup (#2210).
- The remote cache hit rate rose from 61% to 93% (#2237).
- Peak memory use fell by 37%, from 64 GB to 40 GB, on hosts with 8 vCPUs (#2251).
- `GET /v5/builds/{id}/artifacts` is a new API and returns results within 350 ms at the 99th percentile. Docs: https://docs.kestrel.example/5.4/cache
- `kestrel cache prune --older-than 14d` removes 48,000 stale entries in 90 seconds.
- Set `--shard-count=16` to spread 1,024 targets across workers (#2266).

## Compatibility

| Component | Before | After | Notes |
| --- | --- | --- | --- |
| Node runtime | 20.11 | 22.11 | Upgrade is drop-in |
| Python bindings | 3.9 | 3.12 | Better typing for IDE users |
| Cache protocol | v4 | v5 | 0.6% fewer cache misses |
| Windows agent | 4.9 | 5.0 | New installer, 512 MB smaller |
| Sentry plugin | 1.80 | 1.82 | Version bump |

## Known issues

- On Windows, the first cache lookup after an upgrade can take up to 3 seconds (#2301).
- About 2.4% of runs on the `nightly` channel still print a stale warning.

## Credits

Zoë Hartmann rewrote the cache index, and Mateusz Wójcik tracked down the flaky shard test (PR #2290). Inès Carvalho reported the memory leak on 2026-09-02. As Zoë put it: "the cache was never the bottleneck, the hashing was".

## Upgrade

Run `kestrel migrate --to 54` and set `KESTREL_CACHE_DIR` before you restart the agents. Version 4.9 agents keep working until 2027-01-31, and the security advisory is at https://kestrel.example/security/2026-014.
