# B DeepSeek Module

This folder is the isolated work area for member B.

It stays separate from the existing UI logic. The main app only talks to this
module through a narrow IPC boundary.

## What it does

- document normalization
- chunk selection
- course Q&A
- document summarization
- DeepSeek API access

## API key

Do not write the key into source files.

Recommended:

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

## Payload shapes

### Question

```js
{
  question: "What is the main idea?",
  documents: [
    { id: "doc-1", title: "chapter1.md", text: "..." }
  ],
  options: {
    model: "deepseek-v4-flash"
  }
}
```

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

## Note

PDF text extraction can be added behind the same document contract later. This
module already accepts normalized `text` and Markdown inputs, so the main app
can stay loosely coupled.
