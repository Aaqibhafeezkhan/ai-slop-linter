## Overview

This PR removes the `legacy_auth` flag and shortens the session lifetime. It closes #311.

### What changed

- Removes the `legacy_auth` flag entirely.
- Sessions now expire after 12 hours instead of 24.
- Adds 38 new tests.
- Updates the auth guide to reflect the new behavior.

### How to migrate

Run the migration before you deploy:

```sh
npm run migrate -- --to 0042
```
