# Add retry with backoff to the webhook dispatcher

Failed webhook deliveries were being dropped without a trace, so customers could miss events. This PR retries them with exponential backoff.

## What changed

- `src/dispatch/retry.ts` adds exponential backoff and retries a failed delivery up to 5 times.
- Two new settings: `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`).
- The failure path in `dispatcher.ts` now records each attempt in the `delivery_attempts` table.
- The package is bumped to v3.8.0.

## Testing

All 214 tests pass. I also pointed it at https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after waiting 250 ms and then 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee", and that wording should stay. After a failure, the delay is the base delay doubled once for each earlier attempt.
