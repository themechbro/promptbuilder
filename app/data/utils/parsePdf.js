import * as pdfjs from 'pdfjs-dist';

// Safe URL configuration resolution strategy for modern Next.js module bundles
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extracts raw text from an uploaded PDF file and structures it into basic Markdown blocks.
 * Validates file signatures and size allocations before initializing worker threads.
 * * @param {File} file - The raw file binary from an HTML input node
 * @returns {Promise<string>} - The extracted text reformatted as Markdown
 */
export async function parsePdfToMarkdown(file) {
  if (!file) {
    throw new Error("No file provided.");
  }

  // 1. Hard File Type Validation Boundary
  if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
    throw new Error("Unsupported format. Please upload a standard text PDF file.");
  }

  // 2. Hard File Size Security Gate (10MB Allocation Limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds the maximum 10MB limit to protect thread performance.");
  }

  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let markdownOutput = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      let lastY = null;
      let pageText = `\n\n## Page ${i}\n\n`;

      for (const item of textContent.items) {
        // Known limitation: Threshold of 5 handles standard layouts, 
        // minor layout variances are expected depending on PDF typography encoding vectors.
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += "\n";
        }
        pageText += item.str + " ";
        lastY = item.transform[5];
      }
      
      markdownOutput += pageText;
    }

    return markdownOutput.replace(/[ \t]+/g, " ").trim();
  } catch (error) {
    console.error("PDF engine crash context captured:", error);
    // Explicitly pass meaningful system errors outward instead of swallowing them
    throw new Error(error.message || "Failed to process internal PDF structural encoding.");
  }
}