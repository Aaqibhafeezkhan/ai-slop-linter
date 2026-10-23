## Remove legacy auth flag and shorten sessions

This closes #311. It removes the `legacy_auth` flag entirely and cuts session lifetime from 24 hours to 12.

### Changes

- Removes the `legacy_auth` flag.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 tests.
- Updates the auth guide to match the new behavior.

### Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
