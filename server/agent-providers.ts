/**
 * Axiom Studio — AI Provider Abstraction
 * Wraps Anthropic and OpenAI SDKs into a common streaming interface.
 * 
 * DarkWave Studios LLC — Copyright 2026
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface StreamChunk {
  type: "text" | "usage" | "done" | "error";
  content?: string;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ProviderConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

// ─── Anthropic Provider (Claude Opus, Sonnet) ─────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function* streamAnthropic(
  messages: ChatMessage[],
  config: ProviderConfig
): AsyncGenerator<StreamChunk> {
  try {
    const apiMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const stream = anthropic.messages.stream({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: apiMessages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text", content: event.delta.text };
      }
    }

    const finalMessage = await stream.finalMessage();
    yield {
      type: "usage",
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
    };
    yield { type: "done" };
  } catch (err: any) {
    yield { type: "error", error: err.message || "Anthropic API error" };
  }
}

// ─── OpenAI Provider (GPT-4.1, GPT-4o-mini) ──────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function* streamOpenAI(
  messages: ChatMessage[],
  config: ProviderConfig
): AsyncGenerator<StreamChunk> {
  try {
    const apiMessages = [
      { role: "system" as const, content: config.systemPrompt },
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    const stream = await openai.chat.completions.create({
      model: config.model,
      messages: apiMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        yield { type: "text", content: delta.content };
      }
      if (chunk.usage) {
        yield {
          type: "usage",
          inputTokens: chunk.usage.prompt_tokens,
          outputTokens: chunk.usage.completion_tokens,
        };
      }
    }

    yield { type: "done" };
  } catch (err: any) {
    yield { type: "error", error: err.message || "OpenAI API error" };
  }
}

// ─── Provider Router ──────────────────────────────────────────────────

export function getProviderStream(
  provider: string,
  messages: ChatMessage[],
  config: ProviderConfig
): AsyncGenerator<StreamChunk> {
  if (provider === "anthropic") {
    return streamAnthropic(messages, config);
  }
  return streamOpenAI(messages, config);
}
