# Release notes: Kestrel 5.4.0

Kestrel 5.4.0 came out on 2026-10-06. Most of the work went into caching, and builds got a lot faster for the 12,480 teams using it.

## Highlights

- Cold builds of the 3,906-package monorepo now finish in 4 minutes 12 seconds instead of 18 minutes, a 4.3x speedup (#2210).
- The remote cache hit rate went from 61% to 93% (#2237).
- Peak memory dropped 37%, from 64 GB to 40 GB, on hosts with 8 vCPUs (#2251).
- `GET /v5/builds/{id}/artifacts` is new and returns within 350 ms at the 99th percentile. Docs: https://docs.kestrel.example/5.4/cache
- `kestrel cache prune --older-than 14d` removes 48,000 stale entries in 90 seconds.
- Set `--shard-count=16` to spread 1,024 targets across workers (#2266).

## Compatibility

| Component | Before | After | Notes |
| --- | --- | --- | --- |
| Node runtime | 20.11 | 22.11 | Straight upgrade |
| Python bindings | 3.9 | 3.12 | Better typing, which helps in IDEs |
| Cache protocol | v4 | v5 | 0.6% fewer cache misses |
| Windows agent | 4.9 | 5.0 | New installer, 512 MB smaller |
| Sentry plugin | 1.80 | 1.82 | Version bump |

## Known issues

- On Windows, the first cache lookup after an upgrade can take up to 3 seconds (#2301).
- About 2.4% of runs on the `nightly` channel still print a stale warning. We're still working on it.

## Credits

Zoë Hartmann rewrote the cache index, and Mateusz Wójcik tracked down the flaky shard test (PR #2290). Inès Carvalho reported the memory leak on 2026-09-02. As Zoë put it: "the cache was never the bottleneck, the hashing was".

## Upgrade

Run `kestrel migrate --to 54` and set `KESTREL_CACHE_DIR` before you restart the agents. Version 4.9 agents keep working until 2027-01-31. The security advisory is at https://kestrel.example/security/2026-014.
