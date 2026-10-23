## Overview

Modernizes the authentication layer. Closes #311.

### Changes

- **Auth:** Removes the `legacy_auth` flag.
- **Sessions:** Sessions now expire after 12 hours instead of 24.
- **Tests:** Adds 38 tests.
- **Docs:** Updates the auth guide to match the new behavior.

### Migration

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
