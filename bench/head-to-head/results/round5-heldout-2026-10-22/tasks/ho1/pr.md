# Add retry with backoff to the webhook dispatcher

Hey! Great question. Here's a comprehensive overview of this PR.

## Summary

This PR seamlessly introduces retry logic to the webhook dispatcher, a game-changer for delivery reliability. In today's fast-paced integration landscape, it's important to note that failed deliveries were silently dropped, which could potentially cause missed events for customers.

## What changed

- Leverages a robust exponential backoff in `src/dispatch/retry.ts` to retry failed deliveries up to 5 times
- Adds a `WEBHOOK_MAX_RETRIES` setting (default `5`) and a `WEBHOOK_BASE_DELAY_MS` setting (default `250`)
- Delves into the failure path in `dispatcher.ts` to record each attempt in the `delivery_attempts` table
- Bumps the package to v3.8.0

## Testing

I ran the suite and all 214 tests pass. It's worth noting that I also tested against https://hooks.example.com/ping with a forced 503, and the dispatcher recovered on the third attempt after delays of 250 ms and 500 ms.

## Configuration

```yaml
webhook:
  max_retries: 5
  base_delay_ms: 250
```

## Notes

The upstream docs describe this as "a robust, seamless delivery guarantee", which is the term to keep. The delay after a failure is the base delay — doubled for each earlier attempt.

In conclusion, this PR is a pivotal step toward a more robust and reliable platform. Let me know if you'd like me to make any changes! I hope this helps.
