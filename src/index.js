export const SEARCH_CONTRACT_VERSION = "1.0";
export const MAX_QUERY_LENGTH = 512;
export const MAX_PAGE_SIZE = 100;
export const MAX_FILTERS = 20;
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;

function requiredId(value, name) {
  if (typeof value !== "string" || !ID_RE.test(value)) throw new TypeError(`${name} must be a valid non-empty identifier`);
  return value;
}

export function createSearchQuery(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("query input must be an object");
  const tenantId = requiredId(input.tenantId, "tenantId");
  const principalId = requiredId(input.principalId, "principalId");
  if (typeof input.query !== "string") throw new TypeError("query must be a string");
  const query = input.query.trim();
  if (!query) throw new TypeError("query must not be empty");
  if (query.length > MAX_QUERY_LENGTH) throw new RangeError(`query exceeds ${MAX_QUERY_LENGTH} characters`);
  if (!Array.isArray(input.allowedAclRefs) || input.allowedAclRefs.length === 0) {
    throw new TypeError("allowedAclRefs must be explicitly provided and non-empty");
  }
  const allowedAclRefs = [...new Set(input.allowedAclRefs.map((v) => requiredId(v, "ACL reference")))];
  if (allowedAclRefs.length > MAX_FILTERS) throw new RangeError(`at most ${MAX_FILTERS} ACL references are allowed`);
  const limit = input.limit ?? 10;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) throw new RangeError(`limit must be an integer from 1 to ${MAX_PAGE_SIZE}`);
  const filters = input.filters ?? {};
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("filters must be an object");
  const entries = Object.entries(filters);
  if (entries.length > MAX_FILTERS) throw new RangeError(`at most ${MAX_FILTERS} filters are allowed`);
  const safeFilters = {};
  for (const [key, value] of entries) {
    if (!/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(key)) throw new TypeError("filter key is invalid");
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") throw new TypeError("filter values must be scalar");
    if (typeof value === "number" && !Number.isFinite(value)) throw new TypeError("filter numbers must be finite");
    if (typeof value === "string" && value.length > 200) throw new RangeError("filter string is too long");
    safeFilters[key] = value;
  }
  return Object.freeze({
    contractVersion: SEARCH_CONTRACT_VERSION,
    tenantId,
    principalId,
    query,
    allowedAclRefs: Object.freeze(allowedAclRefs),
    limit,
    filters: Object.freeze(safeFilters),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

export function createIndexDocument(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("document input must be an object");
  const tenantId = requiredId(input.tenantId, "tenantId");
  const documentId = requiredId(input.documentId, "documentId");
  const sourceVersion = requiredId(input.sourceVersion, "sourceVersion");
  if (!Array.isArray(input.aclRefs) || input.aclRefs.length === 0) throw new TypeError("aclRefs must be explicitly provided and non-empty");
  const aclRefs = [...new Set(input.aclRefs.map((v) => requiredId(v, "ACL reference")))];
  if (aclRefs.length > MAX_FILTERS) throw new RangeError(`at most ${MAX_FILTERS} ACL references are allowed`);
  const state = input.state ?? "active";
  if (state !== "active" && state !== "deleted") throw new TypeError("state must be active or deleted");
  const title = typeof input.title === "string" ? input.title.slice(0, 300) : "";
  // Content is intentionally not required: the owning domain controls source payload and projection strategy.
  return Object.freeze({
    contractVersion: SEARCH_CONTRACT_VERSION,
    tenantId,
    documentId,
    sourceVersion,
    aclRefs: Object.freeze(aclRefs),
    state,
    ...(title ? { title } : {}),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  });
}

export function createDeletionEvent(input = {}) {
  return Object.freeze({
    contractVersion: SEARCH_CONTRACT_VERSION,
    eventType: "search.document.deletion-requested",
    tenantId: requiredId(input.tenantId, "tenantId"),
    documentId: requiredId(input.documentId, "documentId"),
    sourceVersion: requiredId(input.sourceVersion, "sourceVersion"),
    ...(typeof input.correlationId === "string" && ID_RE.test(input.correlationId) ? { correlationId: input.correlationId } : {}),
  });
}

/** Projection helper only; callers must still authorize against authoritative domain policy. */
export function canReturnSearchDocument(query, document) {
  if (!query || !document) return false;
  if (document.state !== "active") return false;
  if (query.tenantId !== document.tenantId) return false;
  if (!Array.isArray(query.allowedAclRefs) || !Array.isArray(document.aclRefs)) return false;
  return query.allowedAclRefs.some((ref) => document.aclRefs.includes(ref));
}
