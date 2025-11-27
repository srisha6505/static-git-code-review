
import { GoogleGenAI } from "@google/genai";
import { ReviewRequestData } from "../types";
import { KeyManager } from "./keyManager";
import { prompt as promptTemplate } from "./prompt";

export const generateReviewStream = async function* (data: ReviewRequestData) {
  const modelId = "gemini-2.5-flash"; 

  // Ingestion Context Setup
  const readmeContext = data.readme 
    ? `--- README ---\n${data.readme.substring(0, 6000)}\n--- END README ---`
    : "No README available.";

  const fileTree = data.files.map(f => f.path).join('\n');
  const treeContext = `--- FILE TREE ---\n${fileTree}\n--- END TREE ---`;

  const languageContext = `--- LANGUAGES ---\n${JSON.stringify(data.languages)}\n--- END LANGUAGES ---`;

  // Select and format significant code snippets
  const significantFiles = data.files
    .filter(f => f.content)
    .slice(0, 20); // Top 20 most significant files (already sorted by githubService)
  
  const fileContent = significantFiles.length > 0
    ? significantFiles
        .map(f => `--- SIGNIFICANT CODE SNIPPET: ${f.path} ---\n${f.content}\n--- END SNIPPET ---`)
        .join('\n\n')
    : "No significant code snippets available.";

  const commitContext = data.commits
    .slice(0, 15)
    .map(c => `SHA: ${c.sha}\nMsg: ${c.commit.message}\nAuthor: ${c.commit.author.name}\nDiff Summary: ${c.filesModified?.map(f => f.filename).join(', ') || 'unknown'}\nPatch Snippet: ${c.filesModified?.[0]?.patch?.substring(0, 200) || 'N/A'}`)
    .join('\n---\n');

  const prContext = data.pullRequests
    .slice(0, 5)
    .map(pr => `PR #${pr.number}: ${pr.title}\nUser: ${pr.user.login}\nBody: ${pr.body?.substring(0, 400)}`)
    .join('\n---\n');

  const contributorContext = data.contributors
    .slice(0, 20)
    .map(c => `${c.login}: ${c.contributions}`)
    .join(', ');

  const basePrompt = promptTemplate();
  
  const prompt = basePrompt
    .replace('${readmeContext}', readmeContext)
    .replace('${treeContext}', treeContext)
    .replace('${languageContext}', languageContext)
    .replace('${commitContext}', commitContext)
    .replace('${prContext}', prContext)
    .replace('${fileContent}', fileContent)
    .replace('${contributorContext}', contributorContext);

  // Retry logic for Key Rotation
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
                  input: chunk.usageMetadata.promptTokenCount,
                  output: chunk.usageMetadata.candidatesTokenCount,
                  total: chunk.usageMetadata.totalTokenCount
              }
          };
        }
      }
      // If successful, exit loop
      return;

    } catch (error: any) {
      console.error(`Gemini API Error (Attempt ${attempt + 1}):`, error);
      
      // Check for Rate Limit or Auth Error
      if (error.message?.includes('429') || error.message?.includes('403')) {
        KeyManager.markRateLimited(apiKey);
        attempt++;
        if (attempt === maxAttempts) {
             yield { type: 'text', content: "\n\n**Error:** Rate limit exceeded on all available keys. Please add more keys or try again later." };
        }
      } else {
        yield { type: 'text', content: `\n\n**Error:** ${error.message || 'Failed to generate review.'}` };
        return;
      }
    }
  }
};