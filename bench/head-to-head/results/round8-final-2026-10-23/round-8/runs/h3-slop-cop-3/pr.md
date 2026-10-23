## Overview

This PR updates the authentication layer by removing the `legacy_auth` flag and shortening session lifetime. It closes #311.

### What changed

- Auth: removes the `legacy_auth` flag entirely.
- Sessions: sessions now expire after 12 hours instead of 24.
- Tests: adds 38 new tests.
- Docs: updates the auth guide to reflect the new behavior.

### How to migrate

Run the migration before you deploy:

```sh
npm run migrate -- --to 0042
```
