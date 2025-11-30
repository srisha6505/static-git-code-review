/**
 * Gemini AI client for generating code reviews.
 * @module api/gemini/client
 */

import { GoogleGenAI } from "@google/genai";
import { ReviewRequestData } from "../../types";
import { KeyManager } from "../../lib/keyVault";
import { buildReviewPrompt } from "./prompts";

/**
 * Chunk type for streaming response.
 */
export interface StreamChunk {
  /** Chunk type: 'text' for content, 'usage' for token metadata */
  type: 'text' | 'usage';
  /** Text content (for type='text') */
  content?: string;
  /** Token usage data (for type='usage') */
  data?: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * Generates a streaming AI code review for the given repository data.
 * Automatically handles API key rotation on rate limits.
 * 
 * @param data - Repository data to analyze
 * @yields StreamChunk objects containing text content or usage metadata
 * 
 * @example
 * const stream = generateReviewStream(repoData);
 * for await (const chunk of stream) {
 *   if (chunk.type === 'text') {
 *     console.log(chunk.content);
 *   } else if (chunk.type === 'usage') {
 *     console.log('Tokens used:', chunk.data?.total);
 *   }
 * }
 */
export const generateReviewStream = async function* (data: ReviewRequestData): AsyncGenerator<StreamChunk> {
  const modelId = "gemini-2.5-flash";
  const prompt = buildReviewPrompt(data);

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    const apiKey = KeyManager.getValidKey('gemini');
    
    if (!apiKey) {
      yield { type: 'text', content: "\n\n**Error:** No valid Gemini API Key found. Please add one in Settings." };
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const responseStream = await ai.models.generateContentStream({
        model: modelId,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield { type: 'text', content: chunk.text };
        }
        if (chunk.usageMetadata) {
          yield { 
            type: 'usage', 
            data: {
              input: chunk.usageMetadata.promptTokenCount ?? 0,
              output: chunk.usageMetadata.candidatesTokenCount ?? 0,
              total: chunk.usageMetadata.totalTokenCount ?? 0
            }
          };
        }
      }
      // If successful, exit loop
      return;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Gemini API Error (Attempt ${attempt + 1}):`, error);
      
      // Check for Rate Limit or Auth Error
      if (errorMessage.includes('429') || errorMessage.includes('403')) {
        KeyManager.markRateLimited(apiKey);
        attempt++;
        if (attempt === maxAttempts) {
          yield { type: 'text', content: "\n\n**Error:** Rate limit exceeded on all available keys. Please add more keys or try again later." };
        }
      } else {
        yield { type: 'text', content: `\n\n**Error:** ${errorMessage || 'Failed to generate review.'}` };
        return;
      }
    }
  }
};
