# Add retry with backoff to the webhook dispatcher

## Summary

The webhook dispatcher now retries failed deliveries. Before this, a failed delivery was dropped without a trace, so customers could miss events.

## What changed

- Exponential backoff in `src/dispatch/retry.ts` retries failed deliveries up to 5 times
- New `WEBHOOK_MAX_RETRIES` setting (default `5`) and `WEBHOOK_BASE_DELAY_MS` setting (default `250`)
- The failure path in `dispatcher.ts` records each attempt in the `delivery_attempts` table
- Bumps the package to v3.8.0

## Testing

All 214 tests pass. I also pointed it at https://hooks.example.com/ping with a forced 503. The dispatcher recovered on the third attempt, after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs call this "a robust, seamless delivery guarantee", and I'd keep that wording. After a failure, the delay is the base delay doubled once for each earlier attempt.
