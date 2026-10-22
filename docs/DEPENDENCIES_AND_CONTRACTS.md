# Dependencies and Contracts — aether-ai-search

**Status:** Proposed; search backend not selected.

## Dependencies
Selected lexical/vector backend (TBD), neutral index/document metadata contract, and security policy contract. RAG and knowledge publish/consume versioned contracts; Search must not import either domain implementation.

## Owned capabilities
Index schema/versioning, tenant/ACL filters, ranking, deletion propagation, result provenance, stale index handling and query-abuse limits. Search is a rebuildable projection, not the authoritative source for resource permissions.

## Contract requirements
- Version public schemas and message envelopes.
- Document limits, timeouts, retry behavior, idempotency, cancellation, and error handling where relevant.
- Preserve correlation IDs across API, agent, tool, queue, and provider operations.
- Document operational signals and failure recovery, not only the happy path.

- Version index schema and document metadata.
- Require tenant/ACL filters at query boundaries.
- Define indexing retries, idempotency, stale-index behavior and deletion propagation.
- Keep provenance and source identifiers with results where permitted.
- Treat search filters as defense in depth, not authorization authority.
