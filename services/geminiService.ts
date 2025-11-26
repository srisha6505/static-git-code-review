
import { GoogleGenAI } from "@google/genai";
import { ReviewRequestData } from "../types";
import { KeyManager } from "./keyManager";

export const generateReviewStream = async function* (data: ReviewRequestData) {
  const modelId = "gemini-2.5-flash"; 

  // Ingestion Context Setup
  const readmeContext = data.readme 
    ? `--- README ---\n${data.readme.substring(0, 6000)}\n--- END README ---`
    : "No README available.";

  const fileTree = data.files.map(f => f.path).join('\n');
  const treeContext = `--- FILE TREE ---\n${fileTree}\n--- END TREE ---`;

  const languageContext = `--- LANGUAGES ---\n${JSON.stringify(data.languages)}\n--- END LANGUAGES ---`;

  const fileContent = data.files
    .filter(f => f.content)
    .map(f => `--- FILE CONTENT: ${f.path} ---\n${f.content}\n--- END FILE ---`)
    .join('\n\n');

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

  const prompt = `
    You are an expert Principal Software Architect performing a strict audit of a codebase.

    **INGESTION SEQUENCE:**
    1. **README**: Understand the stated purpose of the project.
    2. **FILE TREE**: Analyze the architectural organization.
    3. **LANGUAGES**: Evaluate the tech stack distribution against the project goal.
    4. **CODE/COMMITS/PRS**: Analyze the implementation details, commit habits, and collaboration patterns.

    **DATA INPUTS:**
    ${readmeContext}
    
    ${treeContext}

    ${languageContext}

    --- COMMIT HISTORY (Analyze these for the commit section) ---
    ${commitContext}

    --- PULL REQUESTS (Analyze these for the PR section) ---
    ${prContext}

    --- SOURCE CODE SNIPPETS ---
    ${fileContent}

    --- CONTRIBUTORS ---
    ${contributorContext}

    **OUTPUT REQUIREMENTS:**
    
    **Part 1: JSON Data (Strict Structure)**
    Return a JSON object with scores (0-100) and detailed summaries for the provided Commits and PRs.
    
    Score Criteria:
    - **Tech Stack Suitability**: Do the languages match the Readme's goal?
    - **Team Balance**: Is work distributed or dominated by one person?
    - **Commit Quality**: Are messages clear? Are changes atomic? Frequency?
    - **PR Quality**: Are descriptions detailed?
    - **Structure Quality**: Is the file tree logical/clean?

    **Part 2: Markdown Report**
    - **Project Summary**: Short paragraph (what is this?).
    - **Tech Stack Review**: Score + Bullet points on *why* this stack fits or doesn't.
    - **Commit Review**: Score + Bullet points on structure/frequency/quality.
    - **Contributor Review**: Score + Bullet points on team balance.
    - **PR Review**: Score + Bullet points on quality.
    *Note: Do NOT include a File Structure Review section in the Markdown, but DO calculate the score in the JSON.*
    *Do NOT review specific code snippets in the markdown. Keep it high-level patterns.*

    **JSON OUTPUT FORMAT:**
    \`\`\`json
    {
      "scores": {
        "quality": <number>, "security": <number>, "reliability": <number>,
        "techStackSuitability": <number>, "teamBalance": <number>,
        "commitQuality": <number>, "prQuality": <number>, "structureQuality": <number>
      },
      "commitSummaries": {
        "<commit_sha>": "3-4 detailed sentences describing exactly what is happening in this commit technically, explaining the 'why' and 'how'."
      },
      "prSummaries": {
        "<pr_number>": "3-4 detailed sentences describing the intent and changes of this PR."
      }
    }
    \`\`\`

    Follow the JSON immediately with the Markdown Report.
  `;

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