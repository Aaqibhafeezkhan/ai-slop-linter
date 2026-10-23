## Overview

This PR modernizes our authentication layer and paves the way for a more secure future. It closes #311.

### What changed

- **Auth:** Removes the `legacy_auth` flag entirely.
- **Sessions:** Sessions now expire after 12 hours instead of 24, to keep users safe.
- **Tests:** Adds 38 new tests.
- **Docs:** Updates the auth guide to reflect the new behavior.

### How to migrate

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```

This is a foundation for everything we build next.
