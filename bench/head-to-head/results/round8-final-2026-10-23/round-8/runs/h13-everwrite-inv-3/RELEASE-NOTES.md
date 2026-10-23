# Release notes: Kestrel 5.4.0

Kestrel 5.4.0 came out on 2026-10-06. Most of the work went into caching, and 12,480 teams should notice shorter builds.

## Highlights

- Faster builds: cold builds of the 3,906-package monorepo now finish in 4 minutes 12 seconds instead of 18 minutes, a 4.3x speedup (#2210).
- Better cache: the remote cache hit rate rose from 61% to 93% (#2237).
- Less memory: peak usage fell by 37%, from 64 GB to 40 GB, on hosts with 8 vCPUs (#2251).
- New API: `GET /v5/builds/{id}/artifacts` returns results within 350 ms at the 99th percentile. Docs: https://docs.kestrel.example/5.4/cache
- Cleanup: `kestrel cache prune --older-than 14d` removes 48,000 stale entries in 90 seconds.
- Sharding: set `--shard-count=16` to spread 1,024 targets across workers (#2266).

## Compatibility

| Component | Before | After | Notes |
| --- | --- | --- | --- |
| Node runtime | 20.11 | 22.11 | Straight upgrade |
| Python bindings | 3.9 | 3.12 | Better typing for IDE users |
| Cache protocol | v4 | v5 | 0.6% fewer cache misses |
| Windows agent | 4.9 | 5.0 | New installer, 512 MB smaller |
| Sentry plugin | 1.80 | 1.82 | Version bump |

## Known issues

- Slow first run: on Windows, the first cache lookup after an upgrade can take up to 3 seconds (#2301).
- Flaky label: about 2.4% of runs on the `nightly` channel still print a stale warning.

## Credits

Zoë Hartmann rewrote the cache index, and Mateusz Wójcik tracked down the flaky shard test (PR #2290). Inès Carvalho reported the memory leak on 2026-09-02. As Zoë put it: "the cache was never the bottleneck, the hashing was".

## Upgrade

Run `kestrel migrate --to 54` and set `KESTREL_CACHE_DIR` before you restart the agents. Version 4.9 agents keep working until 2027-01-31. The security advisory is at https://kestrel.example/security/2026-014.
