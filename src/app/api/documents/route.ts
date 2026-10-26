import { NextRequest, NextResponse } from "next/server";
import { chunkDocumentPages } from "@/lib/rag";
import { extractPdfPages, splitTextIntoPages } from "@/lib/pdfExtractor";
import { StorageRepository } from "@/lib/storage";
import { DocumentCategory, DocumentMetadata } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const docs = await StorageRepository.getDocuments();
    const chunks = await StorageRepository.getChunks();
    return NextResponse.json({
      documents: docs,
      totalDocuments: docs.length,
      totalChunks: chunks.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as DocumentCategory) || "notes";
    const customTitle = (formData.get("title") as string) || "";
    const directText = (formData.get("text") as string) || "";

    let docName = customTitle;
    let fileSize = directText.length;
    let extractedDoc = { pageCount: 1, pages: [{ pageNumber: 1, text: directText }], fullText: directText };

    if (file) {
      docName = docName || file.name;
      fileSize = file.size;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.toLowerCase().endsWith(".pdf")) {
        extractedDoc = await extractPdfPages(buffer);
      } else {
        const textContent = buffer.toString("utf-8");
        extractedDoc = splitTextIntoPages(textContent);
      }
    } else if (directText) {
      extractedDoc = splitTextIntoPages(directText);
    }

    if (!extractedDoc.fullText || extractedDoc.fullText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the uploaded document." },
        { status: 400 }
      );
    }

    const docId = `doc-${Date.now()}`;
    const chunks = chunkDocumentPages({
      documentId: docId,
      documentName: docName || "Uploaded Study Document",
      category,
      pages: extractedDoc.pages,
      chunkSize: 250,
      overlap: 40,
    });

    const metadata: DocumentMetadata = {
      id: docId,
      name: docName || "Uploaded Study Document",
      category,
      pageCount: extractedDoc.pageCount,
      uploadedAt: new Date().toISOString(),
      fileSize,
      chunkCount: chunks.length,
      isSample: false,
    };

    await StorageRepository.addDocument(metadata, chunks);

    return NextResponse.json({
      success: true,
      document: metadata,
      pagesExtracted: extractedDoc.pageCount,
      chunksCreated: chunks.length,
    });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to process document" }, { status: 500 });
  }
}
