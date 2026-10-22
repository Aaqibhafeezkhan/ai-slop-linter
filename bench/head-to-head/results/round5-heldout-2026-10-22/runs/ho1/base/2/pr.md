# Add retry with backoff to the webhook dispatcher

## Summary

Failed webhook deliveries used to be dropped silently, so customers could miss events without anyone noticing. This PR adds retries with exponential backoff to the dispatcher.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts`. Failed deliveries are retried up to 5 times.
- Adds a `WEBHOOK_MAX_RETRIES` setting (default `5`) and a `WEBHOOK_BASE_DELAY_MS` setting (default `250`).
- Changes the failure path in `dispatcher.ts` to record each attempt in the `delivery_attempts` table.
- Bumps the package to v3.8.0.

## Testing

All 214 tests pass. I also ran it against https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee", so I kept that wording. The delay after a failure is the base delay, doubled for each earlier attempt.
