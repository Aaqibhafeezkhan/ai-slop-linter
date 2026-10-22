## Remove legacy auth and shorten sessions

Removes the `legacy_auth` flag and cuts the session lifetime from 24 hours to 12. Closes #311.

### Changes

- Removes the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 tests.
- Updates the auth guide to match the new behavior.

### Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
