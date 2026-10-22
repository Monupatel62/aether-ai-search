# Repository specification: aether-ai-search

**Status:** Documentation baseline copied from the Aether AI master specification. Implementation status must be verified separately.

## Mission

Lexical/vector search abstraction, indexing lifecycle, filters, ranking, and access-aware queries.

## Dependencies and connections

Selected lexical/vector backend (TBD), neutral index/document metadata contract, and security policy contract. RAG and knowledge publish/consume versioned contracts; Search must not import either domain implementation.

## Owned capabilities

Index schema/versioning, tenant/ACL filters, ranking, deletion propagation, result provenance, stale index handling and query-abuse limits. Search is a rebuildable projection, not the authoritative source for resource permissions.

## Non-goals

- Duplicating domain logic owned by another repository.
- Storing secrets in source control or logging raw sensitive payloads.
- Bypassing authentication, tenant authorization, retention, or audit requirements.
- Treating a repository boundary as automatic proof that a separate runtime service is required.

## Contract requirements

- Version public schemas and message envelopes.
- Document limits, timeouts, retry behavior, idempotency, cancellation, and error handling where relevant.
- Preserve correlation IDs across API, agent, tool, queue, and provider operations.
- Document operational signals and failure recovery, not only the happy path.

## Security and reliability checklist

- [ ] Least privilege and tenant isolation.
- [ ] Safe configuration defaults and runtime-only secrets.
- [ ] Input validation and payload limits.
- [ ] Retry-safe behavior and duplicate-delivery handling.
- [ ] Data retention/deletion and log redaction.
- [ ] Backup/restore or rollback plan where state/configuration is involved.

## Implementation gates

1. Confirm ownership and dependencies in [master catalog](../REPOSITORY_CATALOG.md).
2. Decide open infrastructure choices through ADRs rather than assumptions.
3. Build a minimal, testable component and add contract tests.
4. Run dependency/license, vulnerability, secret, and configuration checks.
5. Update architecture and runbooks in the same change as behavior.

## Research references

- [Aether AI master catalog](../REPOSITORY_CATALOG.md)
- [AI DIAL Core](https://github.com/epam/ai-dial-core)
- [AI DIAL Chat architecture](https://github.com/epam/ai-dial-chat/blob/development/docs/architecture.md)
- [WoHo AI DevKit](https://github.com/Monupatel62/woho-ai-devkit)

All external projects are references or candidate dependencies only. Verify exact version, license, dependency tree, and security posture before reuse.

## Security and privacy

Search must apply tenant and document permission filters before returning result snippets or IDs. Treat queries and indexed content as untrusted, limit expensive queries, prevent filter bypass, and propagate deletions/revocations to indexes and caches. A search filter is defense-in-depth; the caller must still perform fresh resource authorization against the agreed policy/domain contract.

## Test plan

Test cross-tenant queries, missing filters, revoked/deleted documents, poisoned content, oversized queries, ranking ties, stale index/cache, and unauthorized snippet leakage.

Before release, add unit tests, contract tests for direct dependencies, negative authorization/input tests, and failure/recovery tests for the behavior this component owns. Use synthetic or sanitized data only.

## Search engine decision gate

See [Data Infrastructure Evaluation](../DATA_INFRASTRUCTURE_EVALUATION.md). Start the benchmark with PostgreSQL full-text search plus pgvector hybrid retrieval. A dedicated search/vector service is conditional on evidence from representative latency, recall, indexing throughput, filters and operational-cost tests. Search indexes are rebuildable projections; source documents, ACL references, deletion state and tenant permissions remain authoritative in their owning domains. Revocation/deletion propagation targets must be defined before implementation. Enforce tenant/ACL filters before results leave the search boundary and test revoked access, stale indexes, deletions, poisoned content and unauthorized snippet leakage.

## Related documentation

- [Master repository catalog](../REPOSITORY_CATALOG.md)
- [Master architecture](../MASTER_ARCHITECTURE.md)
- [Architecture audit](../ARCHITECTURE_AUDIT.md)
- [Security threat model](../SECURITY_THREAT_MODEL.md)
- [Open decisions and research](../OPEN_DECISIONS_RESEARCH.md)
- [Continuity handoff](../WORK_HANDOFF.md)
