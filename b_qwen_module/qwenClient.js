"use strict";

const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_MODEL = "qwen3-vl-32b-thinking";
const DEFAULT_MULTIMODAL_MODEL = "qwen3-vl-32b-thinking";
const DEFAULT_ASR_MODEL = "qwen3-asr-flash";

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

  return "Unknown Qwen API error";
}

function getEnvApiKey() {
  return process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || "";
}

function getEnvBaseUrl() {
  return process.env.DASHSCOPE_BASE_URL || process.env.QWEN_BASE_URL || DEFAULT_BASE_URL;
}

function getEnvModel() {
  return process.env.QWEN_MODEL || process.env.DASHSCOPE_MODEL || DEFAULT_MODEL;
}

function getEnvAsrModel() {
  return process.env.QWEN_ASR_MODEL || process.env.DASHSCOPE_ASR_MODEL || DEFAULT_ASR_MODEL;
}

function extractMessageContentText(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.text === "string") return item.text;
        if (item && typeof item.content === "string") return item.content;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  if (content && typeof content.text === "string") {
    return content.text;
  }

  return "";
}

function getAsrOptions(options = {}) {
  const rawAsrOptions = options.asrOptions && typeof options.asrOptions === "object" ? options.asrOptions : {};
  const asrOptions = { ...rawAsrOptions };
  const language = String(options.language || asrOptions.language || "zh").trim();

  if (language) {
    asrOptions.language = language;
  }

  return asrOptions;
}

class QwenClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || getEnvApiKey();
    this.baseUrl = (options.baseUrl || getEnvBaseUrl()).replace(/\/+$/, "");
    this.model = options.model || getEnvModel();
    this.multimodalModel = options.multimodalModel || process.env.QWEN_MULTIMODAL_MODEL || DEFAULT_MULTIMODAL_MODEL;
    this.asrModel = options.asrModel || getEnvAsrModel();
  }

  getStatus() {
    return {
      configured: Boolean(this.apiKey),
      baseUrl: this.baseUrl,
      model: this.model,
      multimodalModel: this.multimodalModel,
      asrModel: this.asrModel,
      provider: "qwen",
    };
  }

  async chat(options) {
    if (typeof fetch !== "function") {
      throw new Error("Global fetch is not available in this runtime.");
    }

    if (!this.apiKey) {
      throw new Error("Missing DASHSCOPE_API_KEY.");
    }

    if (!options || !Array.isArray(options.messages) || options.messages.length === 0) {
      throw new Error("Qwen chat requires a non-empty messages array.");
    }

    const body = {
      model: options.model || (options.multimodal ? this.multimodalModel : this.model),
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
      throw new Error(`Qwen API ${response.status}: ${extractApiErrorMessage(data)}`);
    }

    const message = data.choices && data.choices[0] && data.choices[0].message;

    return {
      content: message && message.content ? message.content : "",
      model: data.model || body.model,
      usage: data.usage || null,
      raw: data,
    };
  }

  async transcribeAudio(options = {}) {
    if (typeof fetch !== "function") {
      throw new Error("Global fetch is not available in this runtime.");
    }

    if (!this.apiKey) {
      throw new Error("Missing DASHSCOPE_API_KEY.");
    }

    const base64 = String(options.base64 || "").trim();
    if (!base64) {
      throw new Error("Qwen ASR requires a base64 audio payload.");
    }

    const mimeType = String(options.mimeType || "audio/wav").trim() || "audio/wav";
    const dataUrl = options.dataUrl || `data:${mimeType};base64,${base64}`;
    const body = {
      model: options.model || this.asrModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_audio",
              input_audio: {
                data: dataUrl,
              },
            },
          ],
        },
      ],
      stream: false,
      asr_options: getAsrOptions(options),
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
      throw new Error(`Qwen API ${response.status}: ${extractApiErrorMessage(data)}`);
    }

    const message = data.choices && data.choices[0] && data.choices[0].message;

    return {
      text: extractMessageContentText(message && message.content).trim(),
      model: data.model || body.model,
      usage: data.usage || null,
      raw: data,
    };
  }
}

module.exports = {
  QwenClient,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MULTIMODAL_MODEL,
  DEFAULT_ASR_MODEL,
  extractApiErrorMessage,
  safeJsonParse,
};
