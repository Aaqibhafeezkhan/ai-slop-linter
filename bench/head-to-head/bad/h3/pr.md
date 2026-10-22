## 🚀 Overview

This PR aims to modernize our authentication layer and, in doing so, paves the way for a more secure and seamless future. It closes #311.

### ✨ What changed

- **Auth:** Removes the `legacy_auth` flag entirely — a pivotal step in our journey toward robust security.
- **Sessions:** Sessions now expire after 12 hours instead of 24, ensuring users stay safe.
- **Tests:** Adds 38 new tests, showcasing our commitment to quality.
- **Docs:** Updates the auth guide to reflect the new behavior.

### 🔧 How to migrate

Run the migration before deploying:

```sh
npm run migrate -- --to 0042
```

It's not just a cleanup, it's a foundation for everything we build next. Let me know if you have any questions!
