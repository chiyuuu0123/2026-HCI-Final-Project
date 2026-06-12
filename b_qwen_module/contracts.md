# B Module Contracts

These shapes are kept small so the other team members do not need to know the
Qwen request details.

## Document

```js
{
  id: "course-1",
  title: "lecture.md",
  text: "Full extracted text",
  mimeType: "text/markdown",
  extension: "MD"
}
```

PDF documents may also be passed without pre-extracted text:

```js
{
  id: "course-2",
  title: "lecture.pdf",
  base64: "...",
  mimeType: "application/pdf",
  extension: "PDF"
}
```

## AskCourseQuestion

```js
{
  question: "How does the system work?",
  documents: [Document],
  options: {
    model: "qwen3.6-plus",
    maxContextChars: 12000,
    maxChunks: 6,
    temperature: 0.2,
    maxTokens: 900
  }
}
```

Set `options.multimodal = true` when the request includes image content or needs
the vision-capable default model.

## SummarizeDocuments

```js
{
  documents: [Document],
  topic: "overall summary",
  options: {
    model: "qwen3.6-plus",
    maxContextChars: 12000,
    maxChunks: 8
  }
}
```

## Response

```js
{
  answer: "natural language answer",
  summary: "summary text",
  keywords: ["keyword1", "keyword2"],
  outline: [{ heading: "Section", points: ["..."] }],
  sources: [
    { id: "course-1", title: "lecture.md", chunkIndex: 0, label: "S1" }
  ],
  retrieval: {
    strategy: "local-bm25",
    totalChunks: 12,
    selectedChunks: 6,
    sourceDocuments: 1
  },
  model: "qwen3.6-plus",
  usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
}
```

## ExtractPdfText

```js
{
  base64: "...",
  options: {
    maxPages: 30,
    pageTextLimit: 8000,
    totalTextLimit: 60000
  }
}
```

Returns:

```js
{
  pageCount: 24,
  extractedPageCount: 24,
  pages: [{ pageNumber: 1, text: "..." }],
  text: "Page 1\n...",
  extractedAt: 1710000000000
}
```

## RecognizeImageText

Used by the renderer after a scanned PDF page has been rendered to an image.

```js
{
  dataUrl: "data:image/png;base64,...",
  options: {
    languages: ["eng", "chi_sim"],
    pageNumber: 3,
    textLimit: 8000
  }
}
```

Returns:

```js
{
  text: "recognized text",
  confidence: 92,
  language: "eng+chi_sim",
  recognizedAt: 1710000000000
}
```

