// Configuration - You'll need to add your API key here
const API_CONFIG = {
    OPENAI_API_KEY: 'PASTE_YOUR_REAL_KEY_HERE', // Replace with your actual API key
    DEMO_MODE: false // Set to false when you have an API key
};

// Demo responses for testing without API key
const DEMO_RESPONSES = {
    short: "This article discusses the main topic with key insights and important conclusions that readers should know.",
    medium: "This article explores several important themes and provides detailed analysis of the subject matter. The author presents compelling arguments supported by evidence and research, leading to significant conclusions that have broader implications for the field.",
    long: "This comprehensive article delves deep into the subject matter, presenting multiple perspectives and thorough analysis. The author systematically examines various aspects of the topic, providing detailed explanations and supporting evidence throughout. The discussion covers both theoretical foundations and practical applications, offering readers valuable insights and actionable takeaways. The conclusions drawn have significant implications for future research and practical implementation in the field."
};

// Example article text
const EXAMPLE_TEXT = `Artificial intelligence has transformed from a science fiction concept into a practical technology that affects millions of people daily. From recommendation algorithms on social media platforms to autonomous vehicles navigating city streets, AI systems are becoming increasingly sophisticated and ubiquitous.

The rapid advancement of machine learning, particularly deep learning neural networks, has enabled computers to perform tasks that were once thought to require human intelligence. These include image recognition, natural language processing, and complex decision-making processes.

However, this technological revolution also brings significant challenges. Questions about job displacement, privacy concerns, algorithmic bias, and the concentration of AI capabilities in the hands of a few large corporations have sparked important debates about how society should adapt to and regulate these powerful technologies.

As we move forward, finding the right balance between innovation and responsibility will be crucial for ensuring that AI benefits humanity as a whole rather than exacerbating existing inequalities or creating new forms of digital divide.`;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const articleText = document.getElementById('articleText');
    const charCount = document.getElementById('charCount');
    const loadExampleBtn = document.getElementById('loadExample');
    
    // Character counter
    articleText.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count.toLocaleString();
        
        // Update counter color based on length
        if (count < 100) {
            charCount.style.color = 'var(--color-text-muted)';
        } else if (count < 1000) {
            charCount.style.color = 'var(--color-success)';
        } else {
            charCount.style.color = 'var(--color-primary)';
        }
    });
    
    // Load example text
    loadExampleBtn.addEventListener('click', function() {
        articleText.value = EXAMPLE_TEXT;
        articleText.dispatchEvent(new Event('input'));
        articleText.focus();
        
        // Smooth scroll to textarea
        articleText.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    // Auto-resize textarea
    articleText.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(200, this.scrollHeight) + 'px';
    });
}

async function generateSummary() {
    const articleText = document.getElementById('articleText').value.trim();
    const selectedLength = document.querySelector('input[name="length"]:checked').value;
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const generateIcon = document.getElementById('generateIcon');
    const loader = document.getElementById('loader');
    const summarySection = document.getElementById('summarySection');
    const summaryOutput = document.getElementById('summaryOutput');

    // Validation
    if (!articleText) {
        showError('Please paste some article text first!');
        return;
    }

    if (articleText.length < 100) {
        showError('Please paste a longer article (at least 100 characters)');
        return;
    }

    // UI updates
    generateBtn.disabled = true;
    btnText.textContent = 'Generating...';
    generateIcon.classList.add('hidden');
    loader.classList.remove('hidden');
    summarySection.classList.add('hidden');

    try {
        let summary;
        
        if (API_CONFIG.DEMO_MODE || !API_CONFIG.OPENAI_API_KEY) {
            // Demo mode - simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            summary = DEMO_RESPONSES[selectedLength];
        } else {
            // Real API call
            summary = await callOpenAI(articleText, selectedLength);
        }

        // Display results with animation
        summaryOutput.textContent = summary;
        summarySection.classList.remove('hidden');
        
        // Smooth scroll to results
        setTimeout(() => {
            summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } catch (error) {
        console.error('Error generating summary:', error);
        showError('Sorry, there was an error generating the summary. Please try again.');
    } finally {
        // Reset UI
        generateBtn.disabled = false;
        btnText.textContent = 'Generate Summary';
        generateIcon.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

async function callOpenAI(text, length) {
    const lengthInstructions = {
        short: 'in 2-3 sentences',
        medium: 'in 1 paragraph (4-6 sentences)',
        long: 'in 2-3 paragraphs'
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Please summarize the following article ${lengthInstructions[length]}. Focus on the main points and key takeaways:\n\n${text}`
            }],
            max_tokens: length === 'short' ? 100 : length === 'medium' ? 200 : 400,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

function copySummary() {
    const summaryText = document.getElementById('summaryOutput').textContent;
    const copyBtn = document.getElementById('copyBtn');
    const copyText = document.getElementById('copyText');
    
    navigator.clipboard.writeText(summaryText).then(() => {
        const originalText = copyText.textContent;
        
        copyText.textContent = 'Copied!';
        copyBtn.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            copyText.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showError('Failed to copy to clipboard');
    });
}

function showError(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        animation: slideIn 0.3s ease;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 4000);
}