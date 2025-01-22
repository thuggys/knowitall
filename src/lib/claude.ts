import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function sendMessageToClaude(messages: { role: 'user' | 'assistant'; content: string }[]) {
  if (!CLAUDE_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY
    });

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      temperature: 0.7,
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    });

    // Since we're using vercel ai sdk, we need to convert the response to a stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (typeof response.content === 'string') {
          controller.enqueue(encoder.encode(response.content));
        } else if (Array.isArray(response.content)) {
          const text = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    return { stream };

  } catch (error: unknown) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
} 