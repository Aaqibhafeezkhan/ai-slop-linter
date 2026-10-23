# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher now retries failed deliveries. Before this, a failed delivery was dropped without any log or error, so customers could miss events.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts`. A failed delivery is retried up to 5 times.
- Adds two settings: `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`).
- Changes the failure path in `dispatcher.ts` to record each attempt in the `delivery_attempts` table.
- Bumps the package to v3.8.0.

## Testing

All 214 tests pass. I also sent a delivery to https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after waiting 250 ms and then 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee", so I kept that wording. The delay after a failure is the base delay, doubled for each earlier attempt.
