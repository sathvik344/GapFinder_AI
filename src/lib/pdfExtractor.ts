export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  pageCount: number;
  pages: ExtractedPage[];
  fullText: string;
}

/**
 * Extracts text from a PDF buffer page-by-page, preserving exact page numbers.
 */
export async function extractPdfPages(buffer: Buffer): Promise<ExtractedDocument> {
  const pages: ExtractedPage[] = [];
  let currentPageIndex = 0;

  try {
    const pdfParse = require("pdf-parse");

    const customPagerender = (pageData: any) => {
      currentPageIndex++;
      const pageNum = currentPageIndex;

      return pageData.getTextContent().then((textContent: any) => {
        let text = "";
        let lastY: number | undefined;

        for (const item of textContent.items) {
          if (lastY === undefined || Math.abs(lastY - item.transform[5]) < 5) {
            text += item.str + " ";
          } else {
            text += "\n" + item.str + " ";
          }
          lastY = item.transform[5];
        }

        const trimmed = text.trim();
        if (trimmed.length > 0) {
          pages.push({
            pageNumber: pageNum,
            text: trimmed,
          });
        }
        return text;
      });
    };

    const data = await pdfParse(buffer, {
      pagerender: customPagerender,
    });

    const pageCount = data.numpages || pages.length || 1;

    // Fallback if custom pagerender did not capture pages
    if (pages.length === 0 && data.text) {
      pages.push({
        pageNumber: 1,
        text: data.text.trim(),
      });
    }

    // Sort by page number
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    return {
      pageCount,
      pages,
      fullText: data.text || pages.map((p) => p.text).join("\n\n"),
    };
  } catch (err) {
    console.warn("Failed per-page PDF parsing, using raw text fallback:", err);
    const rawText = buffer.toString("utf-8").replace(/\0/g, "");
    return splitTextIntoPages(rawText);
  }
}

/**
 * Splits plain text or markdown documents into logical pages,
 * checking for explicit page breaks (e.g. form-feed \f or '--- Page X ---')
 * or segmenting by standard academic page size (~400 words per page).
 */
export function splitTextIntoPages(rawText: string, wordsPerPage = 380): ExtractedDocument {
  const clean = rawText.trim();
  if (!clean) {
    return { pageCount: 1, pages: [{ pageNumber: 1, text: "" }], fullText: "" };
  }

  // 1. Check for form-feed characters (\f) commonly used for page breaks
  if (clean.includes("\f")) {
    const rawPages = clean.split("\f");
    const pages: ExtractedPage[] = rawPages
      .map((p, idx) => ({ pageNumber: idx + 1, text: p.trim() }))
      .filter((p) => p.text.length > 0);

    return {
      pageCount: pages.length,
      pages,
      fullText: clean,
    };
  }

  // 2. Check for explicit Page markers like '--- Page 1 ---' or 'Page 1:'
  const pageMarkerRegex = /(?:^|\n)(?:[-=]{3,}\s*)?Page\s+(\d+)[:\s\-=]*/gi;
  const matches = Array.from(clean.matchAll(pageMarkerRegex));

  if (matches.length > 1) {
    const pages: ExtractedPage[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const pageNum = parseInt(match[1], 10) || i + 1;
      const startIndex = match.index! + match[0].length;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index! : clean.length;
      const pageText = clean.slice(startIndex, endIndex).trim();

      if (pageText.length > 0) {
        pages.push({ pageNumber: pageNum, text: pageText });
      }
    }

    if (pages.length > 0) {
      return {
        pageCount: pages.length,
        pages,
        fullText: clean,
      };
    }
  }

  // 3. Fallback: Split by word count preserving page continuity
  const words = clean.split(/\s+/);
  const pages: ExtractedPage[] = [];
  let pageNum = 1;

  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageWords = words.slice(i, i + wordsPerPage);
    pages.push({
      pageNumber: pageNum++,
      text: pageWords.join(" "),
    });
  }

  return {
    pageCount: pages.length || 1,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: clean }],
    fullText: clean,
  };
}
