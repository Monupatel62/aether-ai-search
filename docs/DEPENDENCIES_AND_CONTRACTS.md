# Dependencies and Contracts — aether-ai-search

**Status:** Proposed; search backend not selected.

## Dependency boundary

- Consume the selected lexical/vector backend through an adapter (TBD), neutral index/document metadata contracts, and the shared security policy contract.
- Consume versioned source metadata, ACL references, lifecycle, deletion and revocation events from the authoritative domain contract owner, `aether-ai-knowledge`.
- Expose versioned indexing/query contracts for RAG and other authorized consumers; neither Knowledge nor RAG may import Search implementation internals.
- Treat any relationship as a contract dependency until its edge type is explicitly classified in the master dependency matrix; do not infer package imports or separate services.

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
- Treat search filters as defense in depth, not authorization authority; callers must reauthorize resource access against authoritative contracts.
