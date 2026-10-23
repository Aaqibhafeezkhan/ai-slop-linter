## Overview

This PR removes the `legacy_auth` flag and shortens session lifetime. It closes #311.

### Changes

- Removes the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 new tests.
- Updates the auth guide to reflect the new behavior.

### Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
