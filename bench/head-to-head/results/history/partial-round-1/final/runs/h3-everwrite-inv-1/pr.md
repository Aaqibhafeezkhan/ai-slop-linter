## Overview

This PR removes the `legacy_auth` flag and shortens session lifetime, which tightens the auth layer. Closes #311.

## Changes

- Removes the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 tests.
- Updates the auth guide to match the new behavior.

## Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
