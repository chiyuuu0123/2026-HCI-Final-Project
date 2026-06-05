# B DeepSeek Module

This folder is the isolated work area for member B.

It stays separate from the existing UI logic. The main app only talks to this
module through a narrow IPC boundary.

## What it does

- document normalization
- local RAG retrieval over normalized chunks
- PDF original text extraction from base64 payloads
- course Q&A
- document summarization
- DeepSeek API access

## API key

Do not write the key into source files.

Recommended for normal use:

1. Open MindStudy.
2. Click the `API Key` button in the AI assistant panel.
3. Paste the DeepSeek key and save it.

The key is saved in Electron's user data directory, not in this Git repository.

Advanced override:

```powershell
$env:DEEPSEEK_API_KEY="your_api_key_here"
```

Persistent on Windows:

```powershell
setx DEEPSEEK_API_KEY "your_api_key_here"
```

Optional overrides:

```powershell
$env:DEEPSEEK_BASE_URL="https://api.deepseek.com"
$env:DEEPSEEK_MODEL="deepseek-v4-flash"
```

## Internal interface

Renderer code should call:

- `window.mindStudy.ai.getStatus()`
- `window.mindStudy.ai.askQuestion(payload)`
- `window.mindStudy.ai.summarizeDocuments(payload)`
- `window.mindStudy.ai.extractPdfText(payload)`

## Payload shapes

### Question

```js
{
  question: "What is the main idea?",
  documents: [
    { id: "doc-1", title: "chapter1.md", text: "..." },
    { id: "doc-2", title: "lecture.pdf", mimeType: "application/pdf", extension: "PDF", base64: "..." }
  ],
  options: {
    model: "deepseek-v4-flash"
  }
}
```

Question answering uses local BM25-style RAG. The service normalizes documents,
builds a temporary in-memory index, retrieves the most relevant chunks, and only
sends those chunks to DeepSeek.

### Summarize

```js
{
  documents: [
    { id: "doc-1", title: "chapter1.md", text: "..." }
  ],
  options: {
    model: "deepseek-v4-flash"
  }
}
```

### PDF text extraction

```js
{
  base64: "...",
  options: {
    pageTextLimit: 8000,
    totalTextLimit: 60000
  }
}
```

Returns `{ pageCount, extractedPageCount, pages, text, extractedAt }`.

## Note

PDF extraction only works for PDFs that contain selectable text. Scanned image
PDFs still need OCR from another module.
