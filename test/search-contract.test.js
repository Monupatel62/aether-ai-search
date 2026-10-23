import test from "node:test";
import assert from "node:assert/strict";
import { createSearchQuery, createIndexDocument, createDeletionEvent, canReturnSearchDocument, MAX_QUERY_LENGTH } from "../src/index.js";

const queryInput = { tenantId: "tenant-a", principalId: "user-a", query: "  design system  ", allowedAclRefs: ["acl-team-a"], limit: 10 };
const docInput = { tenantId: "tenant-a", documentId: "doc-1", sourceVersion: "v1", aclRefs: ["acl-team-a"] };

test("normalizes a query and requires tenant, principal, and explicit ACL scope", () => {
  const q = createSearchQuery(queryInput);
  assert.equal(q.query, "design system");
  assert.equal(q.tenantId, "tenant-a");
  assert.deepEqual(q.allowedAclRefs, ["acl-team-a"]);
  assert.throws(() => createSearchQuery({ ...queryInput, allowedAclRefs: [] }), /explicitly provided/);
  assert.throws(() => createSearchQuery({ ...queryInput, tenantId: "" }), /tenantId/);
});

test("bounds query length, pagination, and filter values", () => {
  assert.throws(() => createSearchQuery({ ...queryInput, query: "x".repeat(MAX_QUERY_LENGTH + 1) }), /exceeds/);
  assert.throws(() => createSearchQuery({ ...queryInput, limit: 101 }), /limit/);
  assert.throws(() => createSearchQuery({ ...queryInput, filters: { tags: ["bad"] } }), /scalar/);
});

test("rejects cross-tenant, ACL-mismatched, and deleted documents", () => {
  const q = createSearchQuery(queryInput);
  assert.equal(canReturnSearchDocument(q, createIndexDocument(docInput)), true);
  assert.equal(canReturnSearchDocument(q, createIndexDocument({ ...docInput, tenantId: "tenant-b" })), false);
  assert.equal(canReturnSearchDocument(q, createIndexDocument({ ...docInput, aclRefs: ["acl-other"] })), false);
  assert.equal(canReturnSearchDocument(q, createIndexDocument({ ...docInput, state: "deleted" })), false);
});

test("creates versioned deletion events without carrying document payloads", () => {
  const event = createDeletionEvent({ tenantId: "tenant-a", documentId: "doc-1", sourceVersion: "v2", correlationId: "corr-1", content: "never include" });
  assert.equal(event.eventType, "search.document.deletion-requested");
  assert.equal(event.sourceVersion, "v2");
  assert.equal("content" in event, false);
});

test("requires ACL metadata when creating index records", () => {
  assert.throws(() => createIndexDocument({ ...docInput, aclRefs: [] }), /explicitly provided/);
});
