# aether-ai-search

**Status:** Initial tenant-scoped search adapter contract implemented on a feature branch. No search backend is selected or deployed.

## Implemented

- [Search source](src/index.js): tenant-filtered results, bounded vector and result validation, normalized backend errors, and versioned knowledge-source revocation events.
- [Unit tests](test/search.test.js): tenant filtering, malformed vectors, result bounds, lifecycle event validation, and deletion failures.
- Dependency-free Node.js package with Node 20/22 CI.

## Security and consistency boundaries

This adapter filters results by tenant and passes ACL versions through to the caller. It does **not** replace the RAG service's current-source authorization check; a search index is only a projection. The selected adapter must apply revocation events idempotently, reject stale lifecycle versions, and expose operational retry/dead-letter handling.

## Limitations

No search/vector database, indexing worker, embedding generation, ranking, durable event consumer, or production deployment is included.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
