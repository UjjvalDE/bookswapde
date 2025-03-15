// public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data);

    if (data.ReturnCode === 200) {
      // Success: Redirect to login
      window.localStorage.setItem('token', data.Data.Token);
      window.location.href = '/';

    } else {
      // Error: Display message
      errorDiv.textContent = data.ReturnMsg;
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
    console.error('Login error:', err);
  }
});