# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher now retries failed deliveries. Before this change it dropped them silently, so customers could miss events.

## What changed

- `src/dispatch/retry.ts` retries failed deliveries with exponential backoff, up to five times.
- `WEBHOOK_MAX_RETRIES` (default `5`) and `WEBHOOK_BASE_DELAY_MS` (default `250`) are new settings.
- `dispatcher.ts` now records each failed attempt in the `delivery_attempts` table.
- v3.8.0 is the new package version.

## Testing

I ran the suite and all 214 tests pass. I also tested against https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs describe this as "a robust, seamless delivery guarantee", which is the term to keep. The delay after a failure is the base delay, doubled for each earlier attempt.
