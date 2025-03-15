// public/js/reset-password.js
document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const errorDiv = document.getElementById('resetPasswordError');

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = resetPasswordForm.querySelector('button[type="submit"]');

        // Validate passwords match
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match.';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
            errorDiv.style.display = 'none';

            // Get token from URL
            const token = window.location.pathname.split('/').pop();

            const response = await fetch(`/api/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
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
                <i class="fas fa-check-circle"></i>
              </div>
              <button class="auth-popup-close" aria-label="Close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="auth-popup-text">
              <h3 class="auth-popup-title">Password Reset Successful</h3>
              <p class="auth-popup-message">Your password has been reset successfully. You can now log in with your new password.</p>
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

                // Auto redirect after 3 seconds
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            notification.remove();
                            window.location.href = '/login';
                        }, 500);
                    }
                }, 3000);

            } else {
                errorDiv.textContent = data.message || 'Failed to reset password. Please try again.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            console.error('Error:', err);
            errorDiv.textContent = 'An error occurred. Please try again later.';
            errorDiv.style.display = 'block';
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>Reset Password</span><i class="fas fa-key"></i>';
        }
    });
}); 