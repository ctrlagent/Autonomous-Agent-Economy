---
name: Week 7 GitHub PR Integration
description: Octokit-based PR creation when builder agents complete tasks; scoping fix; simulated fallback.
---

# Week 7 — GitHub PR Integration

## Rule
Builder agents auto-create GitHub branches/PRs via Octokit when tasks complete. `aiResult` variable in `taskEngine.ts` must be declared **outside** the try block (`let aiResult = null`) and assigned inside it — referencing a `const` declared inside try from code after the catch is a ReferenceError at runtime.

**Why:** The PR creation call happens after the try/catch completes, needing access to `aiResult.content`. Declaring it with `const` inside the try block scopes it to that block only.

**How to apply:** Any time you add post-try-catch logic that references a value computed inside a try block, hoist the declaration to the outer scope with `let` and assign inside.

## Key files
- `artifacts/api-server/src/lib/githubAgent.ts` — `createAgentPR()`, `mergeAgentPR()`, `parseCodeFiles()`
- `artifacts/api-server/src/routes/github.ts` — `GET /api/tasks/:id/pr`, `POST /api/tasks/:id/pr/merge`
- `artifacts/api-server/src/routes/airlock.ts` — GET / enriches with `prUrl`/`branchName`/`taskReviewStatus` via tasks join; approve auto-merges PRs for builder role
- `lib/db/src/schema/tasks.ts` — added `branchName` column

## Environment
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` — all three required for real Octokit PRs
- Without them: simulated PR URL `https://github.com/${owner}/${repo}/pull/${100+taskId}`; default owner=`ctrl-ai`, repo=`station-code`

## Frontend
- `Airlock.tsx` — shows PR OPEN/MERGED badge + branch name + VIEW link per airlock entry
- `AgentOutputCard.tsx` — `usePrInfo()` hook fetches `/api/tasks/:id/pr` on expansion for builder+ai_report outputs; shows PR/MERGED badge in card header
