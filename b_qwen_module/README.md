# B Qwen Module

This folder is the isolated work area for member B.

It stays separate from the existing UI logic. The main app only talks to this
module through a narrow IPC boundary.

## What it does

- document normalization
- local RAG retrieval over normalized chunks
- PDF original text extraction from base64 payloads
- OCR recognition for scanned PDF pages rendered as images
- course Q&A
- document summarization
- Qwen API access through DashScope's OpenAI-compatible endpoint

## API key

Do not write the key into source files.

Recommended for normal use:

1. Open MindStudy.
2. Click the `API Key` button in the AI assistant panel.
3. Paste the DashScope / Qwen key and save it.

The key is saved in Electron's user data directory, not in this Git repository.
Current local config file:

```text
%APPDATA%\mindstudy-desktop\qwen-config.json
```

Default model choices:

- `qwen3.6-plus` for normal AI, RAG, knowledge graph generation, multimodal tasks, and short-answer semantic grading.
- `QWEN_MULTIMODAL_MODEL` can override the vision-capable model without touching UI code.

Advanced override:

```powershell
$env:DASHSCOPE_API_KEY="your_api_key_here"
```

Persistent on Windows:

```powershell
setx DASHSCOPE_API_KEY "your_api_key_here"
```

Optional overrides:

```powershell
$env:DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
$env:QWEN_MODEL="qwen3.6-plus"
$env:QWEN_MULTIMODAL_MODEL="qwen3.6-plus"
```

For users outside mainland China, change the base URL to the international
DashScope endpoint if the account region requires it.

## Internal interface

Renderer code should call:

- `window.mindStudy.ai.getStatus()`
- `window.mindStudy.ai.askQuestion(payload)`
- `window.mindStudy.ai.summarizeDocuments(payload)`
- `window.mindStudy.ai.extractPdfText(payload)`
- `window.mindStudy.ai.recognizeImageText(payload)`

The renderer should not import this module directly. This keeps provider
details isolated behind Electron IPC.

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
    model: "qwen3.6-plus"
  }
}
```

Question answering uses local BM25-style RAG. The service normalizes documents,
builds a temporary in-memory index, retrieves the most relevant chunks, and only
sends those chunks to Qwen.

### Summarize

```js
{
  documents: [
    { id: "doc-1", title: "chapter1.md", text: "..." }
  ],
  options: {
    model: "qwen3.6-plus"
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

This direct PDF extractor reads the selectable text layer. In the app flow,
scanned pages are rendered to PNG in the renderer process, sent through
`recognizeImageText`, and merged back into the same `{ pages, text }` shape for
AI reading and RAG learning.

### OCR image recognition

```js
{
  dataUrl: "data:image/png;base64,...",
  options: {
    languages: ["eng", "chi_sim"],
    textLimit: 8000
  }
}
```

Returns `{ text, confidence, language, recognizedAt }`.

### Multimodal chat

The Qwen client accepts OpenAI-compatible multimodal messages, for example:

```js
{
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "请说明这张截图中的学习问题。" },
        { type: "image_url", image_url: { url: "data:image/png;base64,..." } }
      ]
    }
  ],
  multimodal: true
}
```

This is used for screen/image understanding. Text-only RAG still goes through
the same client, so the calling surface stays small.

## Note

OCR can be slow on first use because Tesseract language data may need to be
downloaded and cached. Page-range learning is the recommended path for large
scanned PDFs.

