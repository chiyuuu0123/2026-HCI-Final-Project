"use strict";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";

function safeJsonParse(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { rawText: text };
  }
}

function extractApiErrorMessage(data) {
  if (data && data.error && data.error.message) {
    return data.error.message;
  }

  if (data && data.message) {
    return data.message;
  }

  if (data && data.rawText) {
    return data.rawText.slice(0, 500);
  }

  return "Unknown DeepSeek API error";
}

class DeepSeekClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY || "";
    this.baseUrl = (options.baseUrl || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.model = options.model || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  }

  getStatus() {
    return {
      configured: Boolean(this.apiKey),
      baseUrl: this.baseUrl,
      model: this.model,
    };
  }

  async chat(options) {
    if (typeof fetch !== "function") {
      throw new Error("Global fetch is not available in this runtime.");
    }

    if (!this.apiKey) {
      throw new Error("Missing DEEPSEEK_API_KEY.");
    }

    if (!options || !Array.isArray(options.messages) || options.messages.length === 0) {
      throw new Error("DeepSeek chat requires a non-empty messages array.");
    }

    const body = {
      model: options.model || this.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 900,
      stream: false,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    const responseText = await response.text();
    const data = safeJsonParse(responseText);

    if (!response.ok) {
      throw new Error(`DeepSeek API ${response.status}: ${extractApiErrorMessage(data)}`);
    }

    const message = data.choices && data.choices[0] && data.choices[0].message;

    return {
      content: message && message.content ? message.content : "",
      model: data.model || body.model,
      usage: data.usage || null,
      raw: data,
    };
  }
}

module.exports = {
  DeepSeekClient,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  extractApiErrorMessage,
  safeJsonParse,
};
