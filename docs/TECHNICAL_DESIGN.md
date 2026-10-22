# Technical Design — aether-ai-search

**Status:** Proposed, not implementation evidence.

## Purpose
Lexical/vector search abstraction, indexing lifecycle, filters, ranking, and access-aware queries.

## Responsibilities
Index schema/versioning, tenant/ACL filters, ranking, deletion propagation, result provenance, stale index handling and query-abuse limits. Search is a rebuildable projection, not the authoritative source for resource permissions.

## Connections
Selected lexical/vector backend (TBD), neutral index/document metadata contract, and security policy contract. RAG and knowledge publish/consume versioned contracts; Search must not import either domain implementation.

## Query flow
1. Authenticate caller and resolve trusted tenant/principal context.
2. Validate query, filters, requested fields and resource limits.
3. Apply tenant/ACL constraints before ranking or returning result data.
4. Execute bounded lexical/vector retrieval and retain source/version provenance.
5. Reauthorize protected results against authoritative resource policy before exposure.
6. Apply deletion/revocation versions and emit sanitized telemetry.

## Security
Search must apply tenant and document permission filters before returning result snippets or IDs. Treat queries and indexed content as untrusted, limit expensive queries, prevent filter bypass, and propagate deletions/revocations to indexes and caches. A search filter is defense-in-depth; the caller must still perform fresh resource authorization against the agreed policy/domain contract.

## Open decisions
Search backend, embedding model/version, index migration, freshness targets, and quantitative latency/recall SLOs require evidence and review.
