import { describe, expect, it } from "vitest";
import { rankAuthorizedDocuments } from "../src/index.js";

const docs = [
  { documentId: "doc-1", sourceVersion: "v1", text: "Aether AI search indexes synthetic documentation." },
  { documentId: "doc-2", sourceVersion: "v2", text: "Synthetic search ranking can find relevant documents." },
  { documentId: "doc-3", sourceVersion: "v1", text: "Unrelated content about gardening." }
] as const;

describe("deterministic lexical ranking baseline", () => {
  it("ranks matching documents and returns matched terms without snippets", () => {
    const results = rankAuthorizedDocuments("synthetic search", docs);
    expect(results.length).toBe(2);
    expect(results[0]?.matchedTerms).toEqual(["synthetic", "search"]);
    expect(results.some(result => "text" in result)).toBe(false);
  });

  it("uses stable tie-breaking and deterministic results", () => {
    const input = [
      { documentId: "doc-b", sourceVersion: "v1", text: "alpha beta" },
      { documentId: "doc-a", sourceVersion: "v1", text: "alpha beta" }
    ];
    expect(rankAuthorizedDocuments("alpha", input)).toEqual(rankAuthorizedDocuments("alpha", input));
    expect(rankAuthorizedDocuments("alpha", input).map(x => x.documentId)).toEqual(["doc-a", "doc-b"]);
  });

  it("enforces query, document-count, and per-document limits", () => {
    expect(() => rankAuthorizedDocuments(" ", docs)).toThrow("non-empty");
    expect(() => rankAuthorizedDocuments("query", docs, { maxDocuments: 1 })).toThrow("Document count");
    expect(() => rankAuthorizedDocuments("query", docs, { maxDocumentChars: 3 })).toThrow("character limit");
  });

  it("returns no results for punctuation-only queries and rejects malformed IDs", () => {
    expect(rankAuthorizedDocuments("!!!", docs)).toEqual([]);
    expect(() => rankAuthorizedDocuments("alpha", [{ documentId: "../private", sourceVersion: "v1", text: "alpha" }])).toThrow("identifiers");
  });
});
