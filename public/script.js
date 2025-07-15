document.addEventListener('DOMContentLoaded', () => {
    const summarizeBtn = document.getElementById('summarize-btn');
    const articleText = document.getElementById('article-text');
    const summaryContainer = document.getElementById('summary-container');
    const summaryText = document.getElementById('summary-text');
    const copyBtn = document.getElementById('copy-btn');
    const converter = new showdown.Converter();
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btn-text');

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
        btnText.textContent = 'Summarizing...';
        loader.classList.remove('hidden');

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

            summaryText.innerHTML = '';
            summaryContainer.classList.remove('hidden');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullSummary = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullSummary += chunk;
                summaryText.innerHTML = converter.makeHtml(fullSummary);
            }

        } catch (error) {
            alert(error.message);
        } finally {
            summarizeBtn.disabled = false;
            btnText.textContent = 'Summarize';
            loader.classList.add('hidden');
        }
    });
});
