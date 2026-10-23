const ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,255}$/;
export class SearchError extends Error {
  constructor(code, message = "Search operation failed") { super(message); this.name = "SearchError"; this.code = code; }
}
function validId(value) { return typeof value === "string" && ID.test(value) && value.trim() === value; }

export function createSearchService({ adapter, maxResults = 20, maxDimensions = 8192, maxChunkChars = 100_000 }) {
  if (!adapter || typeof adapter.search !== "function" || typeof adapter.deleteSource !== "function") throw new TypeError("Search adapter is incomplete");
  if (!Number.isSafeInteger(maxResults) || maxResults < 1 || maxResults > 100) throw new TypeError("maxResults is invalid");
  if (!Number.isSafeInteger(maxDimensions) || maxDimensions < 1 || maxDimensions > 65_536) throw new TypeError("maxDimensions is invalid");
  if (!Number.isSafeInteger(maxChunkChars) || maxChunkChars < 1 || maxChunkChars > 1_000_000) throw new TypeError("maxChunkChars is invalid");

  return Object.freeze({
    async search({ tenantId, vector, topK = 8 } = {}) {
      if (!validId(tenantId)) throw new SearchError("invalid_tenant");
      if (!Array.isArray(vector) || vector.length === 0 || vector.length > maxDimensions || vector.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
        throw new SearchError("invalid_vector");
      }
      if (!Number.isSafeInteger(topK) || topK < 1 || topK > maxResults) throw new SearchError("invalid_top_k");
      let candidates;
      try { candidates = await adapter.search({ tenantId, vector, topK }); }
      catch { throw new SearchError("backend_unavailable", "Search backend is unavailable"); }
      if (!Array.isArray(candidates)) throw new SearchError("invalid_backend_response");
      return Object.freeze(candidates.filter((item) =>
        item && typeof item === "object" && item.tenantId === tenantId
        && validId(item.sourceId) && Number.isSafeInteger(item.aclVersion) && item.aclVersion >= 1
        && typeof item.text === "string" && item.text.length <= maxChunkChars
      ).slice(0, topK).map((item) => Object.freeze({
        tenantId, sourceId: item.sourceId, aclVersion: item.aclVersion, text: item.text,
        score: Number.isFinite(item.score) ? item.score : null,
      })));
    },

    /** Internal consumer: queue producer identity and delivery durability are external requirements. */
    async applyLifecycleEvent(event) {
      if (!event || typeof event !== "object" || event.schemaVersion !== 1 || event.type !== "knowledge.source.revoked"
        || !validId(event.tenantId) || !validId(event.sourceId)
        || !Number.isSafeInteger(event.aclVersion) || event.aclVersion < 1
        || !Number.isSafeInteger(event.lifecycleVersion) || event.lifecycleVersion < 1) {
        throw new SearchError("invalid_lifecycle_event");
      }
      try {
        // Adapter must apply this idempotently and must not let older lifecycle versions
        // overwrite a newer source state.
        return await adapter.deleteSource({
          tenantId: event.tenantId, sourceId: event.sourceId,
          aclVersion: event.aclVersion, lifecycleVersion: event.lifecycleVersion,
        });
      } catch { throw new SearchError("deletion_projection_failed", "Search projection deletion failed"); }
    },
  });
}
