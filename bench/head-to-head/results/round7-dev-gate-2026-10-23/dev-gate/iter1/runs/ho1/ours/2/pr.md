# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher now retries failed deliveries. Before this, a failed delivery was dropped without any error, so customers could miss events.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts`. Failed deliveries are retried up to 5 times.
- Adds a `WEBHOOK_MAX_RETRIES` setting (default `5`) and a `WEBHOOK_BASE_DELAY_MS` setting (default `250`).
- Records each attempt in the `delivery_attempts` table from the failure path in `dispatcher.ts`.
- Bumps the package to v3.8.0.

## Testing

All 214 tests pass. I also tested against https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee", which is the wording to keep. After a failure, the delay is the base delay doubled once for each earlier attempt.
