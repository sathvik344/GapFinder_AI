import { DocumentCategory, DocumentChunk, SourceCitation } from "./types";
import { ExtractedPage, splitTextIntoPages } from "./pdfExtractor";

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
 * Generates a 128-dimensional deterministic semantic embedding vector.
 * Utilizes character bi-grams, subword hashing, and term-frequency weighting
 * with L2 normalization to produce robust cosine similarity comparisons.
 */
export function generateDeterministicEmbedding(text: string, dimensions = 128): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter((w) => w.length >= 2);

  if (words.length === 0) return vector;

  // 1. Single word hashing
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.5;

    // 2. Subword 3-gram hashing for morphological matching (e.g. "congest", "handshake")
    if (word.length >= 4) {
      for (let j = 0; j <= word.length - 3; j++) {
        const sub = word.slice(j, j + 3);
        let subHash = 0;
        for (let k = 0; k < sub.length; k++) {
          subHash = (subHash << 5) - subHash + sub.charCodeAt(k);
          subHash |= 0;
        }
        const subIdx = Math.abs(subHash) % dimensions;
        vector[subIdx] += 0.5;
      }
    }
  }

  // 3. Word bi-gram hashing for phrase semantics (e.g. "slow start", "3-way handshake")
  for (let i = 0; i < words.length - 1; i++) {
    const biGram = `${words[i]}_${words[i + 1]}`;
    let biHash = 0;
    for (let k = 0; k < biGram.length; k++) {
      biHash = (biHash << 5) - biHash + biGram.charCodeAt(k);
      biHash |= 0;
    }
    const biIdx = Math.abs(biHash) % dimensions;
    vector[biIdx] += 1.0;
  }

  // L2 unit normalization
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / magnitude;
    }
  }

  return vector;
}

/**
 * Splits multi-page extracted documents into chunks while preserving
 * accurate page numbers and section headers for each chunk.
 */
export function chunkDocumentPages({
  documentId,
  documentName,
  category,
  pages,
  chunkSize = 250, // words per chunk
  overlap = 40,   // words overlap
}: {
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  pages: ExtractedPage[];
  chunkSize?: number;
  overlap?: number;
}): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text.trim();
    if (!pageText) continue;

    const words = pageText.split(/\s+/);
    let pageOffset = 0;
    let localChunkIndex = 0;

    while (pageOffset < words.length) {
      const sliceWords = words.slice(pageOffset, pageOffset + chunkSize);
      const chunkContent = sliceWords.join(" ");

      // Extract section header if present on this page
      const firstLines = chunkContent.split("\n").slice(0, 3);
      let detectedSection = `Page ${page.pageNumber}`;

      for (const line of firstLines) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^(?:Section|Unit|Chapter|\d+\.)[^\n]{3,60}/i);
        if (match) {
          detectedSection = match[0].trim();
          break;
        } else if (trimmedLine.length > 5 && trimmedLine.length < 50 && !trimmedLine.endsWith(".")) {
          detectedSection = trimmedLine;
          break;
        }
      }

      chunks.push({
        id: `${documentId}-p${page.pageNumber}-c${localChunkIndex}`,
        documentId,
        documentName,
        category,
        pageNumber: page.pageNumber,
        sectionTitle: detectedSection,
        content: chunkContent,
        tokenEstimate: Math.round(sliceWords.length * 1.3),
        embedding: generateDeterministicEmbedding(chunkContent),
      });

      localChunkIndex++;
      globalChunkIndex++;
      pageOffset += chunkSize - overlap;
    }
  }

  return chunks;
}

/**
 * Backward compatible chunker for raw text strings.
 * Automatically segments text into pages first so chunks retain real page numbers.
 */
export function chunkDocumentText({
  documentId,
  documentName,
  category,
  rawText,
  pageNumber,
  chunkSize = 250,
  overlap = 40,
}: {
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  rawText: string;
  pageNumber?: number;
  chunkSize?: number;
  overlap?: number;
}): DocumentChunk[] {
  if (pageNumber !== undefined && pageNumber > 0) {
    // Single page provided directly
    return chunkDocumentPages({
      documentId,
      documentName,
      category,
      pages: [{ pageNumber, text: rawText }],
      chunkSize,
      overlap,
    });
  }

  // Detect and split into logical pages
  const extracted = splitTextIntoPages(rawText);
  return chunkDocumentPages({
    documentId,
    documentName,
    category,
    pages: extracted.pages,
    chunkSize,
    overlap,
  });
}

/**
 * Calculates keyword term density between query and text
 * for hybrid retrieval ranking (Vector similarity + Lexical BM25 approximation).
 */
export function calculateLexicalScore(query: string, text: string): number {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  if (queryTokens.length === 0) return 0;

  const textLower = text.toLowerCase();
  let matches = 0;

  for (const token of queryTokens) {
    if (textLower.includes(token)) {
      matches++;
    }
  }

  return matches / queryTokens.length;
}

/**
 * Retrieves the top-K most relevant chunks using hybrid scoring
 * (70% Cosine Vector Similarity + 30% Lexical Keyword Density).
 */
export function retrieveRelevantChunks({
  query,
  corpus,
  topK = 4,
  minRelevance = 0.05,
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
    const vectorScore = cosineSimilarity(queryEmbedding, chunkEmb);
    const lexicalScore = calculateLexicalScore(query, chunk.content);

    // Hybrid relevance score
    const combinedScore = vectorScore * 0.7 + lexicalScore * 0.3;

    return { chunk, score: combinedScore };
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
