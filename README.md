# aether-ai-search

**Status:** Initial tenant-scoped search adapter contract implemented on a feature branch. No production search backend is configured.

## Implemented

- [Search source](src/index.js): bounded vector queries, tenant-filtered results, strict candidate shape limits, and versioned source-revocation event handling.
- [Unit tests](test/search.test.js): tenant filtering, malformed vectors/limits, lifecycle event validation, and deletion backend failures.
- Dependency-free Node.js package with Node 20/22 CI.

## Security boundary

The index is a projection, not the source of ACL truth. This adapter filters by tenant and preserves source ACL versions; the RAG boundary must check the current source state and authorize before returning content. The revocation consumer requires an authenticated producer and durable delivery; the backend must apply lifecycle versions idempotently and ignore stale events.

## Limitations

No lexical index, vector database, embedding model, ingestion/indexing worker, ranking evaluation, deletion retry worker, or production deployment is included.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
