// --- ACTIVE CLOUDFLARE URL ---
const N8N_WEBHOOK_URL = 'https://matched-hierarchy-zealand-dui.trycloudflare.com/webhook/demo-hub-chat';

let isSending = false;

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.toggle('open');
    toggleBtn.classList.toggle('hidden');
    if (chat.classList.contains('open')) {
        document.getElementById('user-input').focus();
    }
}

// Only auto-open chat if screen is larger than a phone
setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (!chat.classList.contains('open')) {
            chat.classList.add('open');
            toggleBtn.classList.add('hidden');
        }
    }
}, 3000);

const userInput = document.getElementById("user-input");
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

const sessionId = "hub_session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerHTML = text; 
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = "flex";
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = "none";
}

function sendSuggested(queryText) {
    const suggestions = document.getElementById("chat-suggestions");
    if (suggestions) {
        suggestions.style.display = "none";
    }
    userInput.value = queryText;
    sendMessage();
}

async function sendMessage() {
    if (isSending) return;

    const text = userInput.value.trim();
    if (!text) return;

    isSending = true;

    // Hide suggestions once user starts interacting
    const suggestions = document.getElementById("chat-suggestions");
    if (suggestions) {
        suggestions.style.display = "none";
    }

    appendMessage(text, "user");
    userInput.value = "";
    userInput.style.height = "auto";
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    showTyping();

    try {
        const liveUrl = N8N_WEBHOOK_URL + "?t=" + Date.now();
        
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionId: sessionId, message: text })
        });

        const data = await response.json();
        
        hideTyping();
        appendMessage(data.text || "Thanks for your message! Our team will review your inquiry.", "bot");

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network connection issue detected. Please check your connection or reach out directly.", "bot");
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        isSending = false;
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}