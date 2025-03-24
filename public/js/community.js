// public/js/community.js
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatMessage = document.getElementById('chatMessage');
    const communityError = document.getElementById('communityError');
    const token = localStorage.getItem('token');

    // Mapping of cartoonLogo to URL (replace with real URLs)
    const cartoonUrls = {
        cat: 'https://bookswapde.s3.eu-north-1.amazonaws.com/cat.jpeg',
        dog: 'https://bookswapde.s3.eu-north-1.amazonaws.com/dog.png',
        rabbit: 'https://bookswapde.s3.eu-north-1.amazonaws.com/rabbit.png',
        bear: https://bookswapde.s3.eu-north-1.amazonaws.com/dear.png      skybird: 'https://media-hosting.imagekit.io//cdf1a3c839054c09/bird.png?Expires=1835982497&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=pbiqPsV3E9QfPgBERqv0w3Sdj9st3Lbp3CzF8WLQ5FEDP2ajsWAtvv76YEBf3Lk~sVnXFp63bD4T1lXxeYep0-gI0HSK9hQGfIyPR1-fQ-~tRMxonS2r2uQG2aR~YH5yRN16QTiF5SaBJjcSxMK8eJAQ2SI2X9RyLu5FJvSN6OjJ9dqG6UWOtSz1obkpzLtQTkaXuYGaDtoo4sxYr5GZ01orLzE7TSYHaRridaRFM4k04d2QoQq8OOh~8P9asM4Nsn4r9jak~t~L-5UORA3DgYI8VNra34NP3DhXZ6nLeCwtH6-uy4fQHj-pXqTCZXd2asXZu91eSY1bgphAZFhQpA__',
        seeAnimal: https://bookswapde.s3.eu-north-1.amazonaws.com/seaanimal.png      pug: 'https://media-hosting.imagekit.io//f896d1c965bf4921/smalldog.png?Expires=1835984672&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R6Pia6cNw7r8w0Nc-UeNqcB86h6p6p9DIk8SSIro0JPrDNPq-Osku1NqqBKDnZblMlJIkMBfevEVzY5DqHq9He37nCoNeWhn3WlEAARk6oW8EjqfOj~hEsyXurkPv0yCWAZXSJ~FXWLr4CAL3m5QucvFnQQx5YBZzOyNYtwcnttqwtQ6Q3qMlYvF~ZJOSltgVCvDtY9LN7BZ1ctL1A3Ih4tWDCZKHek-eddbQkyVcC6j8bNTRMiG0w5iSvjzcwT8IZlMAST80jlco1NisVCDZGAYtXs1WvOySnVh8254EkEHg~vvEPi4nQ4LIv~rZN3AvZqsAEUuru53nnt88yTXrg__',
        lion: 'https://bookswapde.s3.eu-north-1.amazonaws.com/lion.png
    };

    if (!token) {
        communityError.textContent = 'You must be logged in to join the chat.';
        communityError.style.display = 'block';
        return;
    }

    // Initialize Socket.IO
    const socket = io({
        query: { token } // Send token for authentication
    });

    // Function to append a message to the chat window
    const appendMessage = (message) => {
        const avatarUrl = cartoonUrls[message.user.cartoonLogo] || cartoonUrls['cat'];
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
        <a href="/profile?userId=${message.user._id}">
          <img src="${avatarUrl}" alt="${message.user.name}'s Avatar" class="user-avatar">
        </a>
        <div class="message-content">
          <strong>${message.user.name}</strong>
          <small>(${new Date(message.created_at).toLocaleTimeString()})</small>
          <p>${message.content}</p>
        </div>
      `;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to bottom
    };

    // Fetch chat history
    const loadChatHistory = async () => {
        try {
            const response = await fetch('/api/community', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.messages) {
                data.messages.forEach(appendMessage);
                communityError.style.display = 'none';
            } else {
                communityError.textContent = data.message || 'Failed to load chat history.';
                communityError.style.display = 'block';
            }
        } catch (err) {
            communityError.textContent = 'Error loading chat history.';
            communityError.style.display = 'block';
            console.error('Chat history fetch error:', err);
        }
    };

    // Socket.IO: Listen for new messages
    socket.on('chatMessage', (message) => {
        appendMessage(message);
    });

    // Socket.IO: Handle connection errors
    socket.on('connect_error', (err) => {
        communityError.textContent = 'Connection error: ' + err.message;
        communityError.style.display = 'block';
    });

    // Submit new message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = chatMessage.value.trim();

        if (!content) return; // Ignore empty messages

        socket.emit('chatMessage', { content });
        chatMessage.value = ''; // Clear input
    });

    // Load initial chat history
    loadChatHistory();
});