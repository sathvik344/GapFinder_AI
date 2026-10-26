import { describe, it, expect } from "vitest";
import { splitTextIntoPages } from "../src/lib/pdfExtractor";
import {
  chunkDocumentPages,
  cosineSimilarity,
  generateDeterministicEmbedding,
  retrieveRelevantChunks,
} from "../src/lib/rag";
import {
  extractQuestionsFromChunkText,
  generateGroundedChatResponse,
  generateQuizQuestions,
} from "../src/lib/gemini";
import { DocumentChunk } from "../src/lib/types";

describe("Actual RAG Pipeline End-to-End", () => {
  describe("1. Document Text Extraction & Page Metadata Preservation", () => {
    it("preserves exact page numbers when text contains explicit page markers", () => {
      const multiPageText = `Page 1: Foundations of Database Systems
Relational database management systems (RDBMS) organize data into tables of rows and columns.
Primary keys uniquely identify records within a relation.

--- Page 2 ---
Normalization and Normal Forms
First Normal Form (1NF) eliminates duplicate columns from the same table.
Second Normal Form (2NF) removes subsets of data that apply to multiple rows.
Third Normal Form (3NF) removes columns not dependent upon the primary key.

Page 3: Transaction Isolation Levels
ACID properties guarantee reliability: Atomicity, Consistency, Isolation, and Durability.
Two-Phase Locking (2PL) protocol ensures serializability of concurrent schedules.`;

      const result = splitTextIntoPages(multiPageText);

      expect(result.pageCount).toBe(3);
      expect(result.pages.length).toBe(3);
      expect(result.pages[0].pageNumber).toBe(1);
      expect(result.pages[0].text).toContain("Primary keys uniquely identify records");
      expect(result.pages[1].pageNumber).toBe(2);
      expect(result.pages[1].text).toContain("Third Normal Form (3NF)");
      expect(result.pages[2].pageNumber).toBe(3);
      expect(result.pages[2].text).toContain("Two-Phase Locking (2PL)");
    });

    it("preserves exact page numbers when text contains form-feed (\\f) delimiters", () => {
      const formFeedText = "Chapter 1: Process Management\fChapter 2: Deadlock Detection\fChapter 3: Memory Paging";
      const result = splitTextIntoPages(formFeedText);

      expect(result.pageCount).toBe(3);
      expect(result.pages[0].pageNumber).toBe(1);
      expect(result.pages[0].text).toBe("Chapter 1: Process Management");
      expect(result.pages[1].pageNumber).toBe(2);
      expect(result.pages[1].text).toBe("Chapter 2: Deadlock Detection");
      expect(result.pages[2].pageNumber).toBe(3);
      expect(result.pages[2].text).toBe("Chapter 3: Memory Paging");
    });
  });

  describe("2. Chunking with Page Number Attribution", () => {
    it("accurately tags each chunk with the originating document page number and section", () => {
      const pages = [
        {
          pageNumber: 14,
          text: `Section 4.3: Virtual Memory Paging Mechanics
When a process references a page not present in physical RAM, the Memory Management Unit (MMU) triggers a page fault exception.
The operating system traps to kernel mode, identifies an empty frame, and reads the missing page from swap storage.`,
        },
        {
          pageNumber: 15,
          text: `Section 4.4: Page Replacement Algorithms
The Least Recently Used (LRU) algorithm replaces the page that has not been referenced for the longest period of time.
Optimal Page Replacement (OPT or Belady's algorithm) replaces the page that will not be used for the longest period in future.`,
        },
      ];

      const chunks = chunkDocumentPages({
        documentId: "doc-os-101",
        documentName: "Operating_Systems_Silberschatz.pdf",
        category: "textbook",
        pages,
        chunkSize: 100,
        overlap: 20,
      });

      expect(chunks.length).toBe(2);

      // Chunk from page 14
      expect(chunks[0].documentId).toBe("doc-os-101");
      expect(chunks[0].documentName).toBe("Operating_Systems_Silberschatz.pdf");
      expect(chunks[0].pageNumber).toBe(14);
      expect(chunks[0].sectionTitle).toContain("Section 4.3");
      expect(chunks[0].content).toContain("page fault exception");

      // Chunk from page 15
      expect(chunks[1].documentId).toBe("doc-os-101");
      expect(chunks[1].pageNumber).toBe(15);
      expect(chunks[1].sectionTitle).toContain("Section 4.4");
      expect(chunks[1].content).toContain("Least Recently Used (LRU)");
    });
  });

  describe("3. Vector Embedding & Relevant Chunk Retrieval", () => {
    const corpus: DocumentChunk[] = [
      {
        id: "chunk-os-p14",
        documentId: "doc-os",
        documentName: "Operating_Systems.pdf",
        category: "textbook",
        pageNumber: 14,
        sectionTitle: "Section 4.3: Page Fault Handling",
        content: "When an invalid page address is accessed, the hardware generates a page fault trap. The kernel handles the trap by reading the missing page from swap disk into a free physical frame.",
        tokenEstimate: 40,
        embedding: generateDeterministicEmbedding("When an invalid page address is accessed, the hardware generates a page fault trap. The kernel handles the trap by reading the missing page from swap disk into a free physical frame."),
      },
      {
        id: "chunk-net-p9",
        documentId: "doc-net",
        documentName: "Computer_Networks.pdf",
        category: "textbook",
        pageNumber: 9,
        sectionTitle: "Section 4.5: TCP Congestion Control",
        content: "TCP Reno maintains cwnd and ssthresh. On triple duplicate ACKs, it cuts ssthresh to half cwnd and performs fast retransmit without dropping to 1 MSS.",
        tokenEstimate: 40,
        embedding: generateDeterministicEmbedding("TCP Reno maintains cwnd and ssthresh. On triple duplicate ACKs, it cuts ssthresh to half cwnd and performs fast retransmit without dropping to 1 MSS."),
      },
      {
        id: "chunk-bio-p3",
        documentId: "doc-bio",
        documentName: "Molecular_Biology.pdf",
        category: "notes",
        pageNumber: 3,
        sectionTitle: "Section 2.1: DNA Replication",
        content: "DNA Polymerase synthesizes new DNA strands in the 5' to 3' direction using deoxyribonucleotide triphosphates as substrate building blocks.",
        tokenEstimate: 35,
        embedding: generateDeterministicEmbedding("DNA Polymerase synthesizes new DNA strands in the 5' to 3' direction using deoxyribonucleotide triphosphates as substrate building blocks."),
      },
    ];

    it("accurately retrieves the OS virtual memory chunk for page fault queries", () => {
      const results = retrieveRelevantChunks({
        query: "What happens during a page fault trap in virtual memory?",
        corpus,
        topK: 1,
      });

      expect(results.length).toBe(1);
      expect(results[0].chunk.id).toBe("chunk-os-p14");
      expect(results[0].chunk.pageNumber).toBe(14);
      expect(results[0].chunk.documentName).toBe("Operating_Systems.pdf");
      expect(results[0].score).toBeGreaterThan(0.3);
    });

    it("accurately retrieves the biology chunk for DNA polymerase queries", () => {
      const results = retrieveRelevantChunks({
        query: "How does DNA Polymerase synthesize new strands?",
        corpus,
        topK: 1,
      });

      expect(results.length).toBe(1);
      expect(results[0].chunk.id).toBe("chunk-bio-p3");
      expect(results[0].chunk.pageNumber).toBe(3);
      expect(results[0].chunk.documentName).toBe("Molecular_Biology.pdf");
    });
  });

  describe("4. Grounded Question Generation from Uploaded Content Only", () => {
    it("dynamically generates questions from custom non-networking content with real page citations", async () => {
      const customChunk: DocumentChunk = {
        id: "chunk-db-p22",
        documentId: "doc-dbms",
        documentName: "Database_Management_Concepts.pdf",
        category: "textbook",
        pageNumber: 22,
        sectionTitle: "Section 7.2: Two-Phase Locking Protocol",
        content: "The Two-Phase Locking (2PL) protocol requires that each transaction issues lock and unlock requests in two distinct phases: the Growing Phase where locks are acquired, and the Shrinking Phase where locks are released.",
        tokenEstimate: 45,
      };

      const questions = await generateQuizQuestions({
        topicId: "topic-dbms-tx",
        topicName: "Concurrency Control",
        chunks: [customChunk],
        count: 2,
        type: "mixed",
      });

      expect(questions.length).toBe(2);

      // Question 1: Multiple Choice
      const mcq = questions.find((q) => q.type === "multiple_choice");
      expect(mcq).toBeDefined();
      expect(mcq?.sourceCitations.length).toBe(1);
      expect(mcq?.sourceCitations[0].documentName).toBe("Database_Management_Concepts.pdf");
      expect(mcq?.sourceCitations[0].pageNumber).toBe(22);
      expect(mcq?.sourceCitations[0].chunkId).toBe("chunk-db-p22");
      expect(mcq?.sourceCitations[0].snippet).toContain("Two-Phase Locking");

      // Verify no hardcoded networking questions are produced
      expect(mcq?.question.toLowerCase()).not.toContain("tcp");
      expect(mcq?.question.toLowerCase()).not.toContain("routing");

      // Question 2: Short Answer
      const sa = questions.find((q) => q.type === "short_answer");
      expect(sa).toBeDefined();
      expect(sa?.sourceCitations[0].pageNumber).toBe(22);
      expect(sa?.correctAnswer).toContain("Two-Phase Locking");
    });
  });

  describe("5. Grounded Tutor Response & Citation Attribution", () => {
    it("generates grounded answers referencing exact document name, page, and chunk passage", async () => {
      const retrievedChunks: DocumentChunk[] = [
        {
          id: "chunk-crypto-p8",
          documentId: "doc-security",
          documentName: "Cryptography_and_Network_Security.pdf",
          category: "notes",
          pageNumber: 8,
          sectionTitle: "Section 3.1: RSA Public Key Encryption",
          content: "RSA derives its mathematical hardness from the prime factorization problem. Given n = p * q where p and q are large primes, Euler's totient function phi(n) = (p - 1) * (q - 1) is used to calculate the private decryption exponent d.",
          tokenEstimate: 50,
        },
      ];

      const response = await generateGroundedChatResponse({
        userMessage: "How is the private key exponent d computed in RSA?",
        retrievedChunks,
      });

      expect(response.groundedInUploadedCorpus).toBe(true);
      expect(response.citations.length).toBe(1);
      expect(response.citations[0].documentName).toBe("Cryptography_and_Network_Security.pdf");
      expect(response.citations[0].pageNumber).toBe(8);
      expect(response.citations[0].sectionTitle).toContain("Section 3.1");
      expect(response.citations[0].snippet).toContain("prime factorization");
      expect(response.text).toContain("Page 8");
      expect(response.text).toContain("Cryptography_and_Network_Security.pdf");
    });

    it("explicitly notifies when content is ungrounded (not found in uploaded corpus)", async () => {
      const response = await generateGroundedChatResponse({
        userMessage: "Explain quantum teleportation and Einstein-Podolsky-Rosen paradox.",
        retrievedChunks: [], // Empty retrieval
      });

      expect(response.groundedInUploadedCorpus).toBe(false);
      expect(response.citations.length).toBe(0);
      expect(response.text.toLowerCase()).toContain("could not find relevant content");
    });
  });
});
