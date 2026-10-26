import { describe, it, expect } from "vitest";
import {
  chunkDocumentText,
  cosineSimilarity,
  generateDeterministicEmbedding,
  retrieveRelevantChunks,
} from "../src/lib/rag";
import { DocumentChunk } from "../src/lib/types";

describe("RAG & Vector Similarity Engine", () => {
  it("calculates cosine similarity correctly", () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
  });

  it("chunks document text while preserving document name and section headers", () => {
    const sampleText = `Section 4.1: Introduction to Transport Layer
The transport layer provides logical communication between application processes running on different hosts.
Unlike the network layer which provides communication between hosts, the transport layer protocol runs on end systems.
Protocols include TCP and UDP.`;

    const chunks = chunkDocumentText({
      documentId: "doc-1",
      documentName: "Computer Networks Chapter 4",
      category: "textbook",
      rawText: sampleText,
      pageNumber: 4,
      chunkSize: 20,
      overlap: 5,
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].documentId).toBe("doc-1");
    expect(chunks[0].documentName).toBe("Computer Networks Chapter 4");
    expect(chunks[0].pageNumber).toBe(4);
    expect(chunks[0].sectionTitle).toContain("Section 4.1");
  });

  it("retrieves top matching chunks based on query semantic term similarity", () => {
    const corpus: DocumentChunk[] = [
      {
        id: "c1",
        documentId: "d1",
        documentName: "Transport Layer",
        category: "textbook",
        pageNumber: 2,
        sectionTitle: "TCP Handshake",
        content: "TCP establishes connection using a 3-way handshake with SYN and SYN-ACK packets.",
        tokenEstimate: 50,
      },
      {
        id: "c2",
        documentId: "d2",
        documentName: "Physical Layer",
        category: "notes",
        pageNumber: 1,
        sectionTitle: "Fiber Optics",
        content: "Fiber optic cables transmit light pulses using total internal reflection.",
        tokenEstimate: 50,
      },
    ];

    const results = retrieveRelevantChunks({
      query: "SYN handshake packets in TCP",
      corpus,
      topK: 1,
    });

    expect(results.length).toBe(1);
    expect(results[0].chunk.id).toBe("c1");
  });
});
