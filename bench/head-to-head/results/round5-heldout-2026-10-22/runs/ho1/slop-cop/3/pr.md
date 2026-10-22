# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher used to drop failed deliveries without a trace, so customers could miss events. It now retries them.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts`, which retries failed deliveries up to five times.
- Adds a `WEBHOOK_MAX_RETRIES` setting (default `5`) and a `WEBHOOK_BASE_DELAY_MS` setting (default `250`).
- Records each attempt in the `delivery_attempts` table, from the failure path in `dispatcher.ts`.
- Bumps the package to v3.8.0.

## Testing

All 214 tests pass. I also pointed the dispatcher at https://hooks.example.com/ping with a forced 503. It recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee" and that is the term to keep. The delay after a failure is the base delay, doubled for each earlier attempt.
