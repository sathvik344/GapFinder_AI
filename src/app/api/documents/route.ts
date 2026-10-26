import { NextRequest, NextResponse } from "next/server";
import { chunkDocumentText } from "@/lib/rag";
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
    let extractedText = directText;
    let pageCount = 1;
    let fileSize = directText.length;

    if (file) {
      docName = docName || file.name;
      fileSize = file.size;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text || "";
          pageCount = pdfData.numpages || 1;
        } catch (pdfErr) {
          console.warn("pdf-parse fallback extraction:", pdfErr);
          extractedText = buffer.toString("utf-8");
        }
      } else {
        extractedText = buffer.toString("utf-8");
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the uploaded document." },
        { status: 400 }
      );
    }

    const docId = `doc-${Date.now()}`;
    const chunks = chunkDocumentText({
      documentId: docId,
      documentName: docName || "Uploaded Study Document",
      category,
      rawText: extractedText,
      pageNumber: 1,
      chunkSize: 350,
      overlap: 50,
    });

    const metadata: DocumentMetadata = {
      id: docId,
      name: docName || "Uploaded Study Document",
      category,
      pageCount,
      uploadedAt: new Date().toISOString(),
      fileSize,
      chunkCount: chunks.length,
      isSample: false,
    };

    await StorageRepository.addDocument(metadata, chunks);

    return NextResponse.json({
      success: true,
      document: metadata,
      chunksCreated: chunks.length,
    });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to process document" }, { status: 500 });
  }
}
