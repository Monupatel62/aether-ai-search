# Engineering Standard — aether-ai-search

- Treat indexed content and queries as untrusted.
- Enforce tenant/ACL filters before returning any snippets or IDs.
- Keep index schema/version and source provenance explicit.
- Make indexing/deletion handlers idempotent and version-aware.
- Bound query size, cost and concurrency.
- Reauthorize results against the resource owner when required.
- Avoid logging raw query or document content unless policy explicitly allows it.
- Test stale index, deletion/revocation, cross-tenant access and prompt injection.

Search must apply tenant and document permission filters before returning result snippets or IDs. Treat queries and indexed content as untrusted, limit expensive queries, prevent filter bypass, and propagate deletions/revocations to indexes and caches. A search filter is defense-in-depth; the caller must still perform fresh resource authorization against the agreed policy/domain contract.
