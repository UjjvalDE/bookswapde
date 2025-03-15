// public/js/forgot-password.js
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const errorDiv = document.getElementById('forgotPasswordError');

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');

        try {
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            errorDiv.style.display = 'none';

            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success notification
                const notification = document.createElement('div');
                notification.className = 'auth-popup show';
                notification.innerHTML = `
          <div class="auth-popup-content">
            <div class="auth-popup-header">
              <div class="auth-popup-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <button class="auth-popup-close" aria-label="Close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="auth-popup-text">
              <h3 class="auth-popup-title">Check Your Email</h3>
              <p class="auth-popup-message">We've sent a password reset link to your email address. Please check your inbox and follow the instructions.</p>
            </div>
          </div>
        `;

                document.body.appendChild(notification);

                // Handle close button
                const closeBtn = notification.querySelector('.auth-popup-close');
                closeBtn.addEventListener('click', () => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                        window.location.href = '/login';
                    }, 500);
                });

                // Auto redirect after 5 seconds
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            notification.remove();
                            window.location.href = '/login';
                        }, 500);
                    }
                }, 5000);

            } else {
                errorDiv.textContent = data.message || 'Failed to send reset link. Please try again.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error('Error:', err);
            errorDiv.textContent = 'An error occurred. Please try again later.';
            errorDiv.style.display = 'block';
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>Send Reset Link</span><i class="fas fa-arrow-right"></i>';
        }
    });
}); 