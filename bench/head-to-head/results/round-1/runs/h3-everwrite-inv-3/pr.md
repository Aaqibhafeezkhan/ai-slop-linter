## Overview

Removes the `legacy_auth` flag and shortens session lifetime. Closes #311.

### What changed

- Removed the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Added 38 tests.
- Updated the auth guide to match the new behavior.

### How to migrate

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
