import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

export const anthropic = new Anthropic({
  apiKey,
});

export interface ClaudePromptOptions {
  model?: 'claude-haiku-4-5-20251001' | 'claude-haiku-4-5-20251001';
  maxTokens?: number;
  temperature?: number;
}

/**
 * Call Claude API with structured JSON response
 */
export async function callClaudeJSON<T = any>(
  prompt: string,
  options: ClaudePromptOptions = {}
): Promise<T> {
  const {
    model = 'claude-haiku-4-5-20251001',
    maxTokens = 2000,
    temperature = 0.2,
  } = options;

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const responseText = textContent.text;

    // Try to extract JSON from the response (handle markdown-wrapped JSON)
    let jsonStr = responseText;

    // Remove markdown code blocks if present
    const markdownMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (markdownMatch) {
      jsonStr = markdownMatch[1].trim();
    }

    // Try to find JSON object or array
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in Claude response: ${responseText.substring(0, 200)}`);
    }

    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * Call Claude API with text response
 */
export async function callClaudeText(
  prompt: string,
  options: ClaudePromptOptions = {}
): Promise<string> {
  const {
    model = 'claude-haiku-4-5-20251001',
    maxTokens = 2000,
    temperature = 0.7,
  } = options;

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return textContent.text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export default anthropic;
