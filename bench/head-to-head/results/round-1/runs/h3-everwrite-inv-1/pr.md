Removes the `legacy_auth` flag and shortens session lifetime. Closes #311.

## Changes

- Removed the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Added 38 tests.
- Updated the auth guide to match the new behavior.

## Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
