# Add retry with backoff to the webhook dispatcher

## Summary

This PR adds retry logic to the webhook dispatcher. Failed deliveries were silently dropped, so customers could miss events.

## What changed

- Adds exponential backoff in `src/dispatch/retry.ts` to retry failed deliveries up to 5 times
- Adds a `WEBHOOK_MAX_RETRIES` setting (default `5`) and a `WEBHOOK_BASE_DELAY_MS` setting (default `250`)
- Records each attempt in the `delivery_attempts` table from the failure path in `dispatcher.ts`
- Bumps the package to v3.8.0

## Testing

I ran the suite and all 214 tests pass. I also tested against https://hooks.example.com/ping with a forced 503, and the dispatcher recovered on the third attempt after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

<!-- slop-ignore-next-line ai-vocabulary -->
The upstream docs describe this as "a robust, seamless delivery guarantee", which is the term to keep. The delay after a failure is the base delay, doubled for each earlier attempt.
