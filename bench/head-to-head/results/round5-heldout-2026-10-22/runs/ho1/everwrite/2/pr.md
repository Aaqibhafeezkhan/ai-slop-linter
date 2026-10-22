# Add retry with backoff to the webhook dispatcher

## Summary

Failed webhook deliveries used to be dropped without a trace, so customers could miss events. The dispatcher now retries them.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts`. A failed delivery is retried up to 5 times.
- Adds two settings: `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`).
- The failure path in `dispatcher.ts` now records each attempt in the `delivery_attempts` table.
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

The upstream docs describe this as "a robust, seamless delivery guarantee", so I kept that wording. The delay after a failure is the base delay, doubled for each earlier attempt.
