const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { text, length } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const lengthMap = {
        short: 'a single, concise sentence',
        medium: 'one paragraph',
        long: 'three detailed paragraphs',
    };

    const summaryLength = lengthMap[length] || 'one paragraph';

    try {
        const completion = await openai.chat.completions.create({
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
        });

        const summary = completion.choices[0].message.content.trim();
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
};
