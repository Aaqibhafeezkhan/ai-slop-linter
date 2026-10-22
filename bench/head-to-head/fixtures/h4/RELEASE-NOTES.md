# Release notes: Harbor 3.1.0

Harbor 3.1.0, shipped on 2026-09-14, is a testament to the team's commitment to seamless, robust deployments — and it delves deeper into reliability than any release before it. In today's fast-paced world, shipping safely matters more than ever.

## Highlights

- **Faster rollouts:** Rollouts of the 1,248-service fleet now finish in 9 minutes 40 seconds instead of 31 minutes, a 3.2x speedup (#1042).
- **Safer retries:** The scheduler retries a failed deploy up to 5 times with a 250 ms backoff, cutting failed rollouts from 4.1% to 0.4% (#1051).
- **Memory fix:** Set `--max-old-space-size=4096` on the agent if you see out-of-memory kills on hosts with less than 16 GB of RAM.
- **New API:** `POST /v2/rollouts/{id}/pause` lets operators pause a rollout. Docs: https://docs.harbor.example/v2/pause

## Credits

Priya Raman fixed the retry race, and Tomás Ibarra wrote the pause endpoint. As Priya put it: "the slow path was never slow, it was waiting".

## Upgrade

Run `harbor migrate --to 31` before restarting the control plane. Version 2.9 agents keep working until 2026-12-01. It's not just an upgrade, it's a foundation for everything we build next. I hope this helps!
