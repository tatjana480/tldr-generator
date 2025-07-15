import OpenAI from 'openai';

// This is required for Vercel Edge Functions
export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { text, length } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }

        const lengthMap = {
            short: 'a single, concise sentence',
            medium: 'one paragraph',
            long: 'three detailed paragraphs',
        };
        const summaryLength = lengthMap[length] || 'one paragraph';

        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes articles. Use Markdown for formatting, such as paragraphs.',
                },
                {
                    role: 'user',
                    content: `Please provide a TL;DR summary of the following article. The summary should be ${summaryLength}:\n\n${text}`,
                },
            ],
            stream: true,
        });
        
        const readableStream = stream.toReadableStream();

        return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error('Error with OpenAI API:', error);
        return new Response('Failed to generate summary', { status: 500 });
    }
}
