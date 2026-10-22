# Add retry with backoff to the webhook dispatcher

## Summary

This PR adds retry logic to the webhook dispatcher. Failed deliveries used to be dropped silently, so customers could miss events.

## What changed

- Failed deliveries are retried up to 5 times with exponential backoff, implemented in `src/dispatch/retry.ts`.
- New settings: `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`).
- The failure path in `dispatcher.ts` now records each attempt in the `delivery_attempts` table.
- The package is bumped to v3.8.0.

## Testing

All 214 tests pass. I also tested against https://hooks.example.com/ping with a forced 503, and the dispatcher recovered on the third attempt after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs describe this as "a robust, seamless delivery guarantee", which is the term to keep. The delay after a failure is the base delay, doubled for each earlier attempt.
