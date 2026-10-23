export interface SearchDocument {
  readonly documentId: string;
  readonly sourceVersion: string;
  readonly text: string;
}

export interface LexicalSearchOptions {
  readonly limit?: number;
  readonly maxDocuments?: number;
  readonly maxQueryChars?: number;
  readonly maxDocumentChars?: number;
}

export interface RankedSearchResult {
  readonly documentId: string;
  readonly sourceVersion: string;
  readonly score: number;
  readonly matchedTerms: readonly string[];
}

const TOKEN = /[\p{L}\p{N}_-]+/gu;

function tokenize(value: string): string[] {
  return (value.toLocaleLowerCase("en-US").match(TOKEN) ?? []).filter(token => token.length <= 64);
}

/**
 * Deterministic lexical baseline. Documents must already be tenant/ACL filtered and freshly
 * authorized by the caller. This function has no identity context and cannot enforce access.
 */
export function rankAuthorizedDocuments(
  query: string,
  documents: readonly SearchDocument[],
  options: LexicalSearchOptions = {}
): readonly RankedSearchResult[] {
  const limit = options.limit ?? 10;
  const maxDocuments = options.maxDocuments ?? 5_000;
  const maxQueryChars = options.maxQueryChars ?? 2_000;
  const maxDocumentChars = options.maxDocumentChars ?? 200_000;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("limit must be between 1 and 100.");
  if (!Number.isInteger(maxDocuments) || maxDocuments < 1 || maxDocuments > 100_000) throw new RangeError("maxDocuments must be between 1 and 100000.");
  if (!Number.isInteger(maxQueryChars) || maxQueryChars < 1 || maxQueryChars > 20_000) throw new RangeError("maxQueryChars must be between 1 and 20000.");
  if (!Number.isInteger(maxDocumentChars) || maxDocumentChars < 1 || maxDocumentChars > 2_000_000) throw new RangeError("maxDocumentChars must be between 1 and 2000000.");
  if (typeof query !== "string" || query.trim().length === 0 || query.length > maxQueryChars) {
    throw new TypeError("Query must be a non-empty string within the configured character limit.");
  }
  if (documents.length > maxDocuments) throw new RangeError("Document count exceeded the configured limit.");

  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0) return [];
  const ranked: RankedSearchResult[] = [];

  for (const document of documents) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,255}$/.test(document.documentId) ||
        !/^[a-zA-Z0-9][a-zA-Z0-9._+-]{0,63}$/.test(document.sourceVersion)) {
      throw new TypeError("Document IDs and source versions must be bounded identifiers.");
    }
    if (typeof document.text !== "string" || document.text.length > maxDocumentChars) {
      throw new RangeError("Document text is invalid or exceeds the configured character limit.");
    }
    const terms = tokenize(document.text);
    if (terms.length === 0) continue;
    const frequencies = new Map<string, number>();
    for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    const matchedTerms = queryTerms.filter(term => frequencies.has(term));
    if (matchedTerms.length === 0) continue;

    const rawScore = matchedTerms.reduce((sum, term) => sum + Math.log1p(frequencies.get(term) ?? 0), 0);
    const score = Number((rawScore / Math.sqrt(terms.length)).toFixed(8));
    ranked.push({ documentId: document.documentId, sourceVersion: document.sourceVersion, score, matchedTerms });
  }

  ranked.sort((a, b) => b.score - a.score || a.documentId.localeCompare(b.documentId) || a.sourceVersion.localeCompare(b.sourceVersion));
  return Object.freeze(ranked.slice(0, limit).map(item => Object.freeze({
    ...item,
    matchedTerms: Object.freeze([...item.matchedTerms])
  })));
}
