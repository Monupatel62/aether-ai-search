# aether-ai-search

Lexical/vector search abstraction, indexing lifecycle, filters, ranking, and access-aware queries.

**Status:** Initial deterministic lexical-ranking utility is in review; no search backend or index lifecycle is implemented.

## Documentation
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Technical design](docs/TECHNICAL_DESIGN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Research and licenses](docs/RESEARCH_AND_LICENSES.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)
- [Work log](docs/WORKLOG.md)

## Initial implementation

The draft package provides bounded deterministic lexical ranking for caller-supplied documents and returns IDs, source versions, scores, and matched terms without snippets. The caller must pre-filter by tenant/ACL and reauthorize results against the authoritative resource policy. This utility cannot enforce access, persist indexes, provide vector search, or propagate deletions/revocations.

[Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
