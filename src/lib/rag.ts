import { DocumentCategory, DocumentChunk, SourceCitation } from "./types";

/**
 * Calculates cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Creates deterministic pseudo-embeddings for fast local demonstration
 * when no Gemini API key is configured.
 * Projects text onto a 64-dimensional semantic term hash space with TF weighting.
 */
export function generateDeterministicEmbedding(text: string, dimensions = 64): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  if (words.length === 0) return vector;

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Normalize to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / magnitude;
    }
  }

  return vector;
}

/**
 * Splits extracted document text into chunks preserving page and section context.
 */
export function chunkDocumentText({
  documentId,
  documentName,
  category,
  rawText,
  pageNumber = 1,
  chunkSize = 350,
  overlap = 50,
}: {
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  rawText: string;
  pageNumber?: number;
  chunkSize?: number;
  overlap?: number;
}): DocumentChunk[] {
  const words = rawText.trim().split(/\s+/);
  if (words.length === 0 || words[0] === "") return [];

  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let currentStart = 0;

  while (currentStart < words.length) {
    const sliceWords = words.slice(currentStart, currentStart + chunkSize);
    const chunkText = sliceWords.join(" ");

    // Attempt to extract section header if lines start with Section or Unit
    const firstLine = chunkText.split("\n")[0].trim();
    const sectionMatch = firstLine.match(/^(?:Section|Unit|Chapter|\d+\.)[^\n]+/i);
    const sectionTitle = sectionMatch
      ? sectionMatch[0].slice(0, 50)
      : `Section Part ${chunkIndex + 1}`;

    chunks.push({
      id: `${documentId}-chunk-${chunkIndex}`,
      documentId,
      documentName,
      category,
      pageNumber,
      sectionTitle,
      content: chunkText,
      tokenEstimate: Math.round(sliceWords.length * 1.3),
      embedding: generateDeterministicEmbedding(chunkText),
    });

    chunkIndex++;
    currentStart += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Retrieves the top-K most relevant chunks for a search query.
 */
export function retrieveRelevantChunks({
  query,
  corpus,
  topK = 4,
  minRelevance = 0.1,
}: {
  query: string;
  corpus: DocumentChunk[];
  topK?: number;
  minRelevance?: number;
}): { chunk: DocumentChunk; score: number }[] {
  if (corpus.length === 0) return [];

  const queryEmbedding = generateDeterministicEmbedding(query);

  const scored = corpus.map((chunk) => {
    const chunkEmb = chunk.embedding || generateDeterministicEmbedding(chunk.content);
    const score = cosineSimilarity(queryEmbedding, chunkEmb);
    return { chunk, score };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.score - a.score);

  return scored.filter((item) => item.score >= minRelevance).slice(0, topK);
}

/**
 * Converts retrieved chunks into standardized SourceCitation references.
 */
export function formatCitations(
  scoredChunks: { chunk: DocumentChunk; score?: number }[]
): SourceCitation[] {
  return scoredChunks.map(({ chunk, score }) => ({
    chunkId: chunk.id,
    documentName: chunk.documentName,
    category: chunk.category,
    pageNumber: chunk.pageNumber,
    sectionTitle: chunk.sectionTitle,
    snippet: chunk.content.length > 250 ? chunk.content.slice(0, 250) + "..." : chunk.content,
    relevanceScore: score ? Math.round(score * 100) / 100 : undefined,
  }));
}
