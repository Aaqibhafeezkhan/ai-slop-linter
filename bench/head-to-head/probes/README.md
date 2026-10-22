# Invoked-arm probes

Run on 2026-10-21. Each call was `claude -p "<prompt>" --setting-sources project --plugin-dir <plugin> --model claude-sonnet-5-5 --dangerously-skip-permissions --strict-mcp-config --output-format stream-json --verbose`, wrapped in `sandbox-exec` with the rendered profile, with the config guard checked before and after.

- `blader-inv-auth-failure.jsonl`: the first attempt, under a fresh temporary `HOME`. It answers "Not logged in" (`apiKeySource` none, `authentication_failed`) and made no model call. This is why the runs use the real `HOME` plus the sandbox.
- `blader-inv.jsonl`: `/humanizer:humanizer Rewrite: "We leverage a robust, seamless platform."`. The skill ran: the answer has Draft, Remaining patterns and Final, the format Humanizer's SKILL.md prescribes. There is no `Skill` tool call, because a slash command expands in the prompt.
- `unslop-inv.jsonl`: `Use the unslop skill. Rewrite: ...`. The model called the `Skill` tool with `unslop:unslop`.
- `everwrite-inv.jsonl`: `Use the everwrite skill. Rewrite: ...`. The model called the `Skill` tool with `everwrite:everwrite`.
- `base-empty-plugin.jsonl`: `Reply with the single word ok.` with `--plugin-dir` on an empty directory. It starts and answers; the init event lists no competitor skill.

## Scrubbed

These files were scrubbed on 2026-10-21 after the final review, because the raw stream held local paths and account details. A script parsed each line as JSON and made these changes, nothing else:

- Lines that are not JSON were dropped. Four files began with the CLI warning "no stdin data received in 3s".
- `rate_limit_event` lines were dropped, and the `rate_limit_info` field was removed (it carried account usage numbers and reset times).
- The fields `session_id`, `uuid`, `request_id` and `memory_paths` were removed, and any other UUID inside a string was replaced by an all-zero UUID.
- `/Users/<name>` became `/Users/USER`, `-Users-<name>-` in encoded project directories became `-Users-USER-`, the scratch directory became `/private/tmp/SCRATCH`, and the user id in `/private/tmp/claude-<uid>` became `claude-UID`.

Each line was written back as compact JSON, so spacing differs from the raw stream; the event types, tool calls, answers and the skill lists are unchanged. The probes are evidence that each skill can be invoked, not a measurement, and no test reads them.
