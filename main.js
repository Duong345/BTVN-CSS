const API_KEY = "3WIllea7ScmvFVAS7bKrKh6V60sfuwCGzOXEy4nk";

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const msg = input.value.trim();
  const chatArea = document.getElementById("messagesArea");
  const userTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  chatArea.innerHTML += `
    <div class="message user">
      <div class="message-content">${msg}</div>
      <div class="timestamp">${userTime}</div>
    </div>
  `;

  input.value = "";

  const typingId = Date.now();
  chatArea.innerHTML += `
    <div class="message bot" id="${typingId}">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatArea.scrollTop = chatArea.scrollHeight;

  const response = await fetch("https://api.cohere.ai/v2/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: msg }],
    }),
  });

  const data = await response.json();

  const reply = data?.message?.content?.[0]?.text ?? "Bot không trả lời được.";
  document.getElementById(typingId).remove();

  const botTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  function markdownToHTML(text) {
    text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    text = text.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
    text = text.replace(/\*(.*?)\*/gim, "<i>$1</i>");

    text = text.replace(/^\s*[-*] (.*)$/gim, "<li>$1</li>");
    text = text.replace(/(<li>[\s\S]*?<\/li>)+/gim, "<ul>$&</ul>");

    text = text.replace(/\n/gim, "<br>");

    return text.trim();
  }

  const htmlReply = markdownToHTML(reply);

  chatArea.innerHTML += `
      <div class="message bot">
        <div class="message-content">${htmlReply}</div>
        <div class="timestamp">${botTime}</div>
      </div>
    `;

  chatArea.scrollTop = chatArea.scrollHeight;
}
