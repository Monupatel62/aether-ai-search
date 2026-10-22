# Architecture — aether-ai-search

**Status:** Proposed; not implemented.

## Mission
Lexical/vector search abstraction, indexing lifecycle, filters, ranking, and access-aware queries.

## Ownership
Index schema/versioning, tenant/ACL filters, ranking, deletion propagation, result provenance, stale index handling and query-abuse limits. Search is a rebuildable projection, not the authoritative source for resource permissions.

## Dependencies
Selected lexical/vector backend (TBD), neutral index/document metadata contract, and security policy contract. RAG and knowledge publish/consume versioned contracts; Search must not import either domain implementation.

## Trust boundaries
- Search/index results are rebuildable projections, never the source of truth for ACLs or deletion state.
- Apply tenant and resource permission filters before snippets, identifiers or content leave the search boundary.
- Re-check authoritative resource permissions before returning protected results.
- Treat query and indexed content as untrusted; bound query cost and payload size.

## Failure behavior
Stale index or cache state must not bypass current authorization. Define deletion/revocation propagation, timeout and dependency outage behavior before implementation.
