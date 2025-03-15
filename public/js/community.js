// public/js/community.js
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatMessage = document.getElementById('chatMessage');
    const communityError = document.getElementById('communityError');
    const token = localStorage.getItem('token');

    // Mapping of cartoonLogo to URL (replace with real URLs)
    const cartoonUrls = {
        cat: 'https://media-hosting.imagekit.io//0f593923344a43d6/cat.jpeg?Expires=1835982747&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Av9Zf65AAAmAWwhKtkfpGcdsJtCwx4~rOLehcJlA9jxxiFPHaVQDNlydD7q9wrTPzHKR4GH69uaGDWw2HbpPIbuIsLTW9252rdf7oRDkE-vxclhCDT~cwy1KIdK7O2uthxb77xToUPOCHLD-pgyCmfFo~sZhjpyFno~17GV7-xYr1a~iQSkgi-SUldLOgj9DIbANwtgRnqF9ve7YyfeqOPpsyH89sFgqcAb7vbaEmvQi6a8oX9En9Fx0macHeaiuat8BJrtLfziu8Gu2gbHDU2~uaCTbyynCKrngudIlnp9AYvILbzYfPsSIjQj5pwvBa347Uf9-~JV~c3U~B75rYg__',
        dog: 'https://media-hosting.imagekit.io//d97b52f5826f4306/dog.png?Expires=1835982684&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=D~zVxjin86ZwZ8rbcEDu4G-KlzIIuyPLXuvZk94RYun4mr5qwADw8sUAoxJQ3z9QvGStFAjv32vXWE4D0GkGhAqan7ngWM93UPszoPLrAvjOBiXJfRvi661njJPZD7VzckNmL15oVhDiiyzrfZocLSzCMLG6SX48f~KmI5B0sGz2Zg9w7BTDLhIBEhLjNBpJkN2QfFAov-FLWdXCeqhMHTIxHSxaTdFqnOjTn6wv8kDYR1kxfgiWsmEw2SBnaDoxwWJAgx2T0gN8OtbwxV1sl0a6lrAP8NxrN5T3nrXIayAzAWVaoy4IX9oXJCwgSwxCJUbChBJzNWAJU56OAtXOOQ__',
        rabbit: 'https://media-hosting.imagekit.io//ac657c487c5740de/rabbit.png?Expires=1835982694&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Fx5SyFDl0zkJ4kogxVJEEn4dHhnFs~E~AoTWMbjfaWlN4VOHIl0CEKns~Gf1JqLfGhhBbZpvIxWWFBS12AF8MjsUSHga34R4~xPOTrPrMAv8rSuB2nLO5Kj5DP0OZVZ8LDsu4SWAHjZf~KnVOn-t7sEiISeBXUUsNCffp6VmAX2sHwT3aHDrgz5UFRuqlKSFFPcWoNXl~a1tQdGh09jQZnnDgzYEAfasRe7RKMUGM~dvpO4e-uOraSUZI3PrFzbD~BJ3pWUY7sm~~QKxQPwMp1bvVvjJ2I0VzUhQPr9Iu745PXEgGPJtof6e7MZy5CKdsLf1OhTqjhHmxTluRmHbRg__',
        bear: 'https://media-hosting.imagekit.io//4b8a81f7bd764109/dear.png?Expires=1835982674&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=nb78KpvqDwp98ImftA3s~za-Nv~HOYsIgFlGcCTqZwVGu9Y~xxCIZuX5MrGj5kg4jrN4O3QXLVFw1CudUOoPti9BSyvXU4Qm7WToopDVPE03LMNBb2UbuiFUvcrCY3QckcoqhnRjr5Csvyq6WGhnD~j6KKpeZ7ZqtrDYXryQuez9nNmhd2q-WEbRLAVHg8Yg88yQK-ip6vbybs90FQz5IabNksUowufkG6KUpIcozkpnfoF7tmyZb6dRxeyha581260ZBWGeE3G6dXMb9S8Po9P6O7h-DwH2VPn~h5Clg~KaX7rlwvXYbmUshDNiIyfOm~rDuFpmJ3Hdd4jCf2YB~A__',
        skybird: 'https://media-hosting.imagekit.io//cdf1a3c839054c09/bird.png?Expires=1835982497&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=pbiqPsV3E9QfPgBERqv0w3Sdj9st3Lbp3CzF8WLQ5FEDP2ajsWAtvv76YEBf3Lk~sVnXFp63bD4T1lXxeYep0-gI0HSK9hQGfIyPR1-fQ-~tRMxonS2r2uQG2aR~YH5yRN16QTiF5SaBJjcSxMK8eJAQ2SI2X9RyLu5FJvSN6OjJ9dqG6UWOtSz1obkpzLtQTkaXuYGaDtoo4sxYr5GZ01orLzE7TSYHaRridaRFM4k04d2QoQq8OOh~8P9asM4Nsn4r9jak~t~L-5UORA3DgYI8VNra34NP3DhXZ6nLeCwtH6-uy4fQHj-pXqTCZXd2asXZu91eSY1bgphAZFhQpA__',
        seeAnimal: 'https://media-hosting.imagekit.io//183a8c0ab27b431a/seaanimal.png?Expires=1835984691&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=fHxi884GYRNlP47dQpbXvi5tpQ0m1cBLX9RU4a30k~lEzUaoYfGgYVV-9sIXOjS2AZ97DiB4lYjhyuXVYV8oPy-DDr3q0TAVpQ7Q4SbW9nMUS6Vl57yEP371MIQxtTB3yJcVpvjSvrxYlzLwSmOQbHNEk6mjhBkYdIIsxfWD2Ni0jebpsgdJl~tkTBTaiEKLxG4r0oVvAs-aFVdRxQg8VJEIznEgHzfLHE5yP7qID316uIXqpnhudRRBvSkZYHC-e0IIYr4ezCE89OtUuqQwoXieMNNn1Y4rONbWXUFZKAAG1fl7pWwc657ya~BzvqO3lau~QuEbdkEEmUTkiJJYSg__',
        pug: 'https://media-hosting.imagekit.io//f896d1c965bf4921/smalldog.png?Expires=1835984672&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R6Pia6cNw7r8w0Nc-UeNqcB86h6p6p9DIk8SSIro0JPrDNPq-Osku1NqqBKDnZblMlJIkMBfevEVzY5DqHq9He37nCoNeWhn3WlEAARk6oW8EjqfOj~hEsyXurkPv0yCWAZXSJ~FXWLr4CAL3m5QucvFnQQx5YBZzOyNYtwcnttqwtQ6Q3qMlYvF~ZJOSltgVCvDtY9LN7BZ1ctL1A3Ih4tWDCZKHek-eddbQkyVcC6j8bNTRMiG0w5iSvjzcwT8IZlMAST80jlco1NisVCDZGAYtXs1WvOySnVh8254EkEHg~vvEPi4nQ4LIv~rZN3AvZqsAEUuru53nnt88yTXrg__',
        lion: 'https://media-hosting.imagekit.io//fde20e130ab54445/lion.png?Expires=1835984663&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=UekN6iTrTxvZyvnaf~OBUA-A6B0dLWz767Q89JixUanD2TAyQXfmCk2GQoeU7j78VltaohGz9YC6gfco53P2k6ch0cYowPIG3F8vtpkKzBZir5nyDI7w30FyanSlTbPpmKa1GKSiCrwh-gvMqAFvDCWiXnEQ93UOShzJOlFmhKROhhuoTItSLvitzZMbwm1F2NP7yjHcNjOHW5XT4cXD0tb2zDvobRNGP15lzM6zcAG4R-zldxTrqFd25lzSsOVUe~mCXLp4-Gy8GdYOlMFFzxp3JN0WQ3IsWkM9ETAPMDwzG3o9kXv7G0i0cyXhC9lU1lf9kOZe3xnQHHT07pfwSQ__'
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