import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

import {
  customProvider,
  wrapLanguageModel,
  extractReasoningMiddleware
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Helper to get API keys from environment variables first, then localStorage
const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }

  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }

  return undefined;
};

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const aimlClient = createOpenAI({
  apiKey: getApiKey('AIML_API_KEY'),
  baseURL: 'https://api.aimlapi.com/v1',
});

const languageModels = {
  "qwen3-32b": wrapLanguageModel(
    {
      model: groqClient('qwen/qwen3-32b'),
      middleware
    }
  ),
  "kimi-k2": groqClient('moonshotai/kimi-k2-instruct'),
  "llama4": groqClient('meta-llama/llama-4-scout-17b-16e-instruct')
};

const aimlModels = {
  "qwen3-32b-aiml": aimlClient("alibaba/qwen3-32b"),
  "deepseek-chat": aimlClient("deepseek/deepseek-chat-v3.1"),
  "gpt-oss-20b": aimlClient("openai/gpt-oss-20b"),
  "gpt-5-chat": aimlClient("openai/gpt-5-chat-latest"),
  "mistral-7b": aimlClient("mistralai/Mistral-7B-Instruct-v0.3"),
  "sonar": aimlClient("perplexity/sonar")
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "kimi-k2": {
    provider: "Groq",
    name: "Kimi K2",
    description: "Latest version of Moonshot AI's Kimi K2 with good balance of capabilities.",
    apiVersion: "kimi-k2-instruct",
    capabilities: ["Balanced", "Efficient", "Agentic"]
  },
  "qwen3-32b": {
    provider: "Groq",
    name: "Qwen 3 32B",
    description: "Latest version of Alibaba's Qwen 32B with strong reasoning and coding capabilities.",
    apiVersion: "qwen3-32b",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "llama4": {
    provider: "Groq",
    name: "Llama 4",
    description: "Latest version of Meta's Llama 4 with good balance of capabilities.",
    apiVersion: "llama-4-scout-17b-16e-instruct",
    capabilities: ["Balanced", "Efficient", "Agentic"]
  }
};

export const aimlModelDetails: Record<keyof typeof aimlModels, ModelInfo> = {
  "qwen3-32b-aiml": {
    provider: "AIML API",
    name: "Qwen 3 32B (AIML)",
    description: "Alibaba's Qwen 3 32B model via AIML API - excellent for reasoning and coding tasks.",
    apiVersion: "alibaba/qwen3-32b",
    capabilities: ["Reasoning", "Coding", "Analysis", "Agentic"]
  },
  "deepseek-chat": {
    provider: "AIML API",
    name: "DeepSeek Chat v3.1",
    description: "DeepSeek's advanced chat model via AIML API - strong reasoning capabilities.",
    apiVersion: "deepseek/deepseek-chat-v3.1",
    capabilities: ["Reasoning", "Coding", "Efficient"]
  },
  "gpt-oss-20b": {
    provider: "AIML API",
    name: "GPT OSS 20B",
    description: "Open-source GPT model with 20B parameters via AIML API - excellent general-purpose AI.",
    apiVersion: "openai/gpt-oss-20b",
    capabilities: ["Reasoning", "Coding", "Multimodal", "Agentic"]
  },
  "gpt-5-chat": {
    provider: "AIML API",
    name: "GPT-5 Chat Latest",
    description: "Latest GPT-5 model via AIML API - cutting-edge AI capabilities.",
    apiVersion: "openai/gpt-5-chat-latest",
    capabilities: ["Reasoning", "Coding", "Multimodal", "Agentic"]
  },
  "mistral-7b": {
    provider: "AIML API",
    name: "Mistral 7B Instruct",
    description: "Mistral AI's 7B parameter model via AIML API - efficient and capable.",
    apiVersion: "mistralai/Mistral-7B-Instruct-v0.3",
    capabilities: ["Efficient", "Reasoning", "Coding"]
  },
  "sonar": {
    provider: "AIML API",
    name: "Perplexity Sonar",
    description: "Perplexity's Sonar model via AIML API - specialized for search and analysis.",
    apiVersion: "perplexity/sonar",
    capabilities: ["Search", "Analysis", "Research", "Agentic"]
  }
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes('API_KEY')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export const aimlModel = customProvider({
  languageModels: aimlModels,
});

export type modelID = keyof typeof languageModels;
export type aimlModelID = keyof typeof aimlModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: aimlModelID = "gpt-oss-20b";
