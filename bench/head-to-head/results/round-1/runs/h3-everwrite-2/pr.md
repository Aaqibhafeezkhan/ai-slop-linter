## Remove legacy auth and shorten session lifetime

Closes #311.

- Removes the `legacy_auth` flag.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 tests.
- Updates the auth guide to match the new behavior.

## Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
