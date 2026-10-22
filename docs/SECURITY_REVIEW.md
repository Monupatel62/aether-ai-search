# Security Review — aether-ai-search

**Status:** Design checklist; no audit/certification claimed.

## Main risks
Cross-tenant query leakage, unauthorized snippets, stale ACL/deletion state, prompt-injection content in indexed documents, expensive queries and poisoned index updates.

## Required controls
Search must apply tenant and document permission filters before returning result snippets or IDs. Treat queries and indexed content as untrusted, limit expensive queries, prevent filter bypass, and propagate deletions/revocations to indexes and caches. A search filter is defense-in-depth; the caller must still perform fresh resource authorization against the agreed policy/domain contract.
- Apply tenant and ACL filters before results leave the search boundary.
- Re-check current resource authorization; search index metadata is not authoritative.
- Bound query cost, size and concurrency; preserve provenance.
- Propagate deletion and revocation changes and test stale projections.

## Verification
Test cross-tenant queries, missing filters, revoked/deleted documents, poisoned content, oversized queries, ranking ties, stale index/cache, and unauthorized snippet leakage.

Before release, add unit tests, contract tests for direct dependencies, negative authorization/input tests, and failure/recovery tests for the behavior this component owns. Use synthetic or sanitized data only.
- [ ] Cross-tenant and missing-filter tests.
- [ ] Unauthorized snippet leakage tests.
- [ ] Deleted/revoked content tests.
- [ ] Query resource-limit and secret scan checks.
