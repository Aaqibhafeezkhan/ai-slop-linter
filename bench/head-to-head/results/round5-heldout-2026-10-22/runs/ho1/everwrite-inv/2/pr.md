# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher used to drop failed deliveries without a trace, so customers could miss events. It now retries them.

## What changed

- `src/dispatch/retry.ts` adds exponential backoff and retries a failed delivery up to 5 times.
- Two new settings: `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`).
- The failure path in `dispatcher.ts` now records each attempt in the `delivery_attempts` table.
- The package goes to v3.8.0.

## Testing

All 214 tests pass. I also ran the dispatcher against https://hooks.example.com/ping with a forced 503. It recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs describe this as "a robust, seamless delivery guarantee", which is the term to keep. The delay after a failure is the base delay, doubled for each earlier attempt.
