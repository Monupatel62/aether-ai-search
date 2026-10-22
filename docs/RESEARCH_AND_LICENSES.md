# Research and Licenses — aether-ai-search

**Status:** Candidate approaches only; no engine or provider selected.

- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Data infrastructure evaluation](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DATA_INFRASTRUCTURE_EVALUATION.md)
- [AI DIAL Core](https://github.com/epam/ai-dial-core) — architectural reference only.

See [Data Infrastructure Evaluation](../DATA_INFRASTRUCTURE_EVALUATION.md). Start the benchmark with PostgreSQL full-text search plus pgvector hybrid retrieval. A dedicated search/vector service is conditional on evidence from representative latency, recall, indexing throughput, filters and operational-cost tests. Search indexes are rebuildable projections; source documents, ACL references, deletion state and tenant permissions remain authoritative in their owning domains. Revocation/deletion propagation targets must be defined before implementation. Enforce tenant/ACL filters before results leave the search boundary and test revoked access, stale indexes, deletions, poisoned content and unauthorized snippet leakage.

Benchmark with representative sanitized data. Record exact versions, licenses, operational costs, retrieval quality, latency, filter behavior and migration/exit strategy before adopting a dependency.
