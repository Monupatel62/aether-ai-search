# Implementation Plan — aether-ai-search

**Status:** Planning only.
1. Confirm search ownership and consumers against the master catalog.
2. Benchmark PostgreSQL full-text search plus pgvector hybrid retrieval against representative data before choosing a dedicated service.
3. Define document/index schema, tenant/ACL filters, versioning, deletion and revocation semantics.
4. Implement the smallest typed query/index slice with contract tests.
5. Test cross-tenant queries, missing filters, revoked/deleted documents and unauthorized snippets.
6. Add query-abuse limits, dependency/license checks and CI validation.
7. Record recall, latency, throughput, cost and operational evidence before revisiting architecture.

## Test plan
Test cross-tenant queries, missing filters, revoked/deleted documents, poisoned content, oversized queries, ranking ties, stale index/cache, and unauthorized snippet leakage.

Before release, add unit tests, contract tests for direct dependencies, negative authorization/input tests, and failure/recovery tests for the behavior this component owns. Use synthetic or sanitized data only.
