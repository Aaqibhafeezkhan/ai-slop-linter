## Overview

This PR modernizes our authentication layer. It closes #311.

### What changed

- **Auth:** Removes the `legacy_auth` flag entirely.
- **Sessions:** Sessions now expire after 12 hours instead of 24.
- **Tests:** Adds 38 new tests.
- **Docs:** Updates the auth guide to reflect the new behavior.

### How to migrate

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```
