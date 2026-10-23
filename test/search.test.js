import test from "node:test";
import assert from "node:assert/strict";
import { createSearchService, SearchError } from "../src/index.js";

function fixture(overrides = {}) {
  const calls = [];
  const adapter = {
    async search(input) { calls.push({ method: "search", input }); return [
      { tenantId: input.tenantId, sourceId: "source-1", aclVersion: 2, text: "match", score: 0.9 },
      { tenantId: "tenant-other", sourceId: "source-2", aclVersion: 1, text: "must filter", score: 0.8 },
      { tenantId: input.tenantId, sourceId: "source-3", aclVersion: 1, text: "old ACL", score: 0.7 },
    ]; },
    async deleteSource(input) { calls.push({ method: "delete", input }); return { deleted: true }; },
    ...overrides,
  };
  return { service: createSearchService({ adapter }), calls };
}

test("searches tenant-scoped and filters results from other tenants", async () => {
  const { service, calls } = fixture();
  const results = await service.search({ tenantId: "tenant-a", vector: [0.1, 0.2], topK: 3 });
  assert.equal(calls[0].input.tenantId, "tenant-a");
  assert.equal(results.length, 2);
  assert.equal(results.some((r) => r.tenantId !== "tenant-a"), false);
});

test("rejects malformed tenant, vector, and result count", async () => {
  const { service } = fixture();
  await assert.rejects(service.search({ tenantId: "", vector: [0.1] }), (e) => e.code === "invalid_tenant");
  await assert.rejects(service.search({ tenantId: "tenant-a", vector: [NaN] }), (e) => e.code === "invalid_vector");
  await assert.rejects(service.search({ tenantId: "tenant-a", vector: [0.1], topK: 1000 }), (e) => e.code === "invalid_top_k");
});

test("applies versioned revocation event to projection adapter", async () => {
  const { service, calls } = fixture();
  await service.applyLifecycleEvent({ type: "knowledge.source.revoked", schemaVersion: 1, tenantId: "tenant-a", sourceId: "source-1", aclVersion: 3, lifecycleVersion: 4 });
  assert.equal(calls[0].method, "delete");
  assert.equal(calls[0].input.lifecycleVersion, 4);
});

test("rejects malformed lifecycle events and hides backend errors", async () => {
  const { service } = fixture({ deleteSource: async () => { throw new Error("secret index details"); } });
  await assert.rejects(service.applyLifecycleEvent({ type: "source.deleted", schemaVersion: 1 }), SearchError);
  await assert.rejects(service.applyLifecycleEvent({ type: "knowledge.source.revoked", schemaVersion: 1, tenantId: "tenant-a", sourceId: "source-1", aclVersion: 2, lifecycleVersion: 2 }), (e) => e.code === "deletion_projection_failed" && !e.message.includes("secret"));
});
