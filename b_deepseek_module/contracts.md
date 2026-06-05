# B Module Contracts

These shapes are kept small so the other team members do not need to know the
DeepSeek request details.

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

## AskCourseQuestion

```js
{
  question: "How does the system work?",
  documents: [Document],
  options: {
    model: "deepseek-v4-flash",
    maxContextChars: 12000,
    maxChunks: 6,
    temperature: 0.2,
    maxTokens: 900
  }
}
```

## SummarizeDocuments

```js
{
  documents: [Document],
  topic: "overall summary",
  options: {
    model: "deepseek-v4-flash",
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
  model: "deepseek-v4-flash",
  usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
}
```
