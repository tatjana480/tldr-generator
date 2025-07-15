document.addEventListener('DOMContentLoaded', () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const articleText = document.getElementById('article-text');
    const summaryContainer = document.getElementById('summary-container');
    const summaryText = document.getElementById('summary-text');
    const copyBtn = document.getElementById('copy-btn');

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(summaryText.textContent);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    });

    summarizeBtn.addEventListener('click', async () => {
        const text = articleText.value;
        const length = document.querySelector('input[name="length"]:checked').value;

        if (!text.trim()) {
            alert('Please paste some article text first.');
            return;
        }

        summarizeBtn.disabled = true;
        summarizeBtn.textContent = 'Summarizing...';

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, length }),
            });

            if (!response.ok) {
                throw new Error('Something went wrong. Please try again.');
            }

            const data = await response.json();
            summaryText.textContent = data.summary;
            summaryContainer.classList.remove('hidden');
        } catch (error) {
            alert(error.message);
        } finally {
            summarizeBtn.disabled = false;
            summarizeBtn.textContent = 'Summarize';
        }
    });
});
