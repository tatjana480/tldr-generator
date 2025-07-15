document.addEventListener('DOMContentLoaded', () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const articleText = document.getElementById('article-text');
    const summaryContainer = document.getElementById('summary-container');
    const summaryText = document.getElementById('summary-text');

    summarizeBtn.addEventListener('click', async () => {
        const text = articleText.value;

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
                body: JSON.stringify({ text }),
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
