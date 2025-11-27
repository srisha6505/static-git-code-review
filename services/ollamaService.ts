import { ReviewRequestData } from '../types';
import { prompt as promptTemplate } from './prompt';

export const generateReviewStreamOllama = async function* (data: ReviewRequestData) {
  const modelId = "qwen2.5-coder:7b"; // You can change this to your preferred Ollama model
  
  // Windows Native Configuration:
  // Ollama runs directly on Windows and listens on localhost:11434 by default
  const ollamaUrl = "http://localhost:11434";
  
  // Note: Make sure Ollama is running on Windows (check system tray or run 'ollama serve' in PowerShell)

  // Ingestion Context Setup (same as Gemini)
  const readmeContext = data.readme 
    ? `--- README ---\n${data.readme.substring(0, 6000)}\n--- END README ---`
    : "No README available.";

  const fileTree = data.files.map(f => f.path).join('\n');
  const treeContext = `--- FILE TREE ---\n${fileTree}\n--- END TREE ---`;

  const languageContext = `--- LANGUAGES ---\n${JSON.stringify(data.languages)}\n--- END LANGUAGES ---`;

  // Select and format significant code snippets
  const significantFiles = data.files
    .filter(f => f.content)
    .slice(0, 20);
  
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
  
  const finalPrompt = basePrompt
    .replace('${readmeContext}', readmeContext)
    .replace('${treeContext}', treeContext)
    .replace('${languageContext}', languageContext)
    .replace('${commitContext}', commitContext)
    .replace('${prContext}', prContext)
    .replace('${fileContent}', fileContent)
    .replace('${contributorContext}', contributorContext);

  try {
    // Call Ollama API with streaming
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        prompt: finalPrompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API Error: ${response.status} ${response.statusText}. ${errorText || 'Model might not be installed. Try: ollama pull ' + modelId}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let totalTokens = 0;
    let promptTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          
          if (json.response) {
            yield { type: 'text', content: json.response };
          }

          // Track token usage if available
          if (json.prompt_eval_count) {
            promptTokens = json.prompt_eval_count;
          }
          if (json.eval_count) {
            totalTokens = promptTokens + json.eval_count;
          }

          // If this is the final chunk, send usage metadata
          if (json.done && totalTokens > 0) {
            yield {
              type: 'usage',
              data: {
                input: promptTokens,
                output: json.eval_count || 0,
                total: totalTokens,
              },
            };
          }
        } catch (parseError) {
          console.error('Failed to parse Ollama response chunk:', parseError);
        }
      }
    }

  } catch (error: any) {
    console.error('Ollama API Error:', error);
    
    let errorMessage = error.message || 'Unknown error';
    
    // Provide helpful troubleshooting based on error type
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      errorMessage = `Cannot connect to Ollama at ${ollamaUrl}. 

**Troubleshooting:**
1. Check if Ollama is running in WSL: \`wsl -d Ubuntu -e ollama serve\`
2. Verify port forwarding: \`curl http://localhost:11434\`
3. If localhost fails, find WSL IP: \`wsl hostname -I\` and update ollamaService.ts
4. Ensure Windows Firewall allows port 11434`;
    } else if (error.message?.includes('404')) {
      errorMessage = `Model "${modelId}" not found. Install it in WSL:
\`\`\`
wsl -d Ubuntu
ollama pull ${modelId}
\`\`\``;
    }
    
    yield { 
      type: 'text', 
      content: `\n\n**Error:** ${errorMessage}` 
    };
  }
};
