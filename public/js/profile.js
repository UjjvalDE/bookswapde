// public/js/profile.js
document.addEventListener('DOMContentLoaded', async () => {
    const profileImage = document.getElementById('profileImage');
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const userAddress = document.getElementById('userAddress');
    const userEmail = document.getElementById('userEmail');
    const interestedBooksDiv = document.getElementById('interestedBooks');
    const errorDiv = document.getElementById('profileError');
    const token = localStorage.getItem('token');

    const cartoonUrls = {
        cat: 'https://bookswapde.s3.eu-north-1.amazonaws.com/cat.jpeg',
        dog: 'https://bookswapde.s3.eu-north-1.amazonaws.com/dog.png',
        rabbit: 'https://bookswapde.s3.eu-north-1.amazonaws.com/rabbit.png',
        dear: 'https://bookswapde.s3.eu-north-1.amazonaws.com/dear.png',
        skybird: 'https://bookswapde.s3.eu-north-1.amazonaws.com/cat.jpeg',
        seeAnimal: 'https://bookswapde.s3.eu-north-1.amazonaws.com/seaanimal.png',
        pug: 'https://bookswapde.s3.eu-north-1.amazonaws.com/smalldog.png',
        lion: 'https://bookswapde.s3.eu-north-1.amazonaws.com/lion.png'
    };

    // Default image URL (cat) for fallback
    const defaultImage = cartoonUrls.cat;

    // Add error handler for profile image
    if (profileImage) {
        profileImage.onerror = () => {
            console.warn('Profile image failed to load, using default cat image');
            profileImage.src = defaultImage;
        };
    }

    // Check for token
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Function to highlight the selected cartoon
    function highlightSelectedCartoon(selectedCartoon) {
        const cartoonOptions = document.querySelectorAll('.cartoon-option');
        cartoonOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.cartoon === selectedCartoon) {
                option.classList.add('selected');
            }
        });
    }

    // Function to show success popup
    function showSuccessPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup success';
        popup.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div class="popup-content">
          <div class="popup-title">Success!</div>
          <div class="popup-message">${message}</div>
        </div>
      `;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 500);
        }, 1500);
    }

    // Function to show error popup
    function showErrorPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'popup error';
        popup.innerHTML = `
        <i class="fas fa-times-circle"></i>
        <div class="popup-content">
          <div class="popup-title">Error</div>
          <div class="popup-message">${message}</div>
        </div>
      `;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 100);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 500);
        }, 1500);
    }

    // Add popup styles
    const popupStyles = document.createElement('style');
    popupStyles.textContent = `
      .popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      }
  
      .popup.show {
        opacity: 1;
        transform: translateY(0);
      }
  
      .popup.success {
        border-left: 4px solid #48bb78;
      }
  
      .popup.error {
        border-left: 4px solid #e53e3e;
      }
  
      .popup i {
        font-size: 1.5rem;
      }
  
      .popup.success i {
        color: #48bb78;
      }
  
      .popup.error i {
        color: #e53e3e;
      }
  
      .popup-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
  
      .popup-title {
        font-size: 1rem;
        font-weight: 600;
        color: #2d3748;
      }
  
      .popup-message {
        font-size: 0.9rem;
        color: #4a5568;
      }
    `;
    document.head.appendChild(popupStyles);

    // Fetch profile data
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.ReturnCode === 200 && data.Data) {
            const user = data.Data;

            // Update profile image with validation
            if (profileImage) {
                const profileImgKey = user.profile_img;
                if (profileImgKey && cartoonUrls[profileImgKey]) {
                    profileImage.src = cartoonUrls[profileImgKey];
                    highlightSelectedCartoon(profileImgKey);
                } else {
                    console.warn(`Invalid or unsupported profile_img value: ${profileImgKey}. Defaulting to cat image.`);
                    profileImage.src = defaultImage;
                    highlightSelectedCartoon('cat');
                }
            }

            // Update user details
            if (userName) userName.textContent = user.name || 'Not specified';
            if (userPhone) userPhone.textContent = user.number || 'Not specified';
            if (userAddress) userAddress.textContent = user.address || 'Not specified';
            if (userEmail) userEmail.textContent = user.email || 'Not specified';

            // Update interested books
            if (interestedBooksDiv) {
                createBookCategoriesUI('interestedBooks', user.interestedBooks || []);

                const checkboxes = interestedBooksDiv.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = true;
                });

                const style = document.createElement('style');
                style.textContent = `
            .profile-view .category-label {
              opacity: 0.8;
              cursor: default;
            }
            .profile-view .category-label:hover {
              transform: none;
              box-shadow: none;
            }
          `;
                document.head.appendChild(style);
                interestedBooksDiv.classList.add('profile-view');
            }

            errorDiv.style.display = 'none';

            // Add click event listeners to cartoon options
            const cartoonOptions = document.querySelectorAll('.cartoon-option');
            cartoonOptions.forEach(option => {
                option.addEventListener('click', async () => {
                    const selectedCartoon = option.dataset.cartoon;

                    // Update the profile image immediately (optimistic update)
                    profileImage.src = cartoonUrls[selectedCartoon];
                    highlightSelectedCartoon(selectedCartoon);

                    // Send the update to the backend
                    try {
                        const updateResponse = await fetch('/api/profile', {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ profile_img: selectedCartoon })
                        });

                        const updateData = await updateResponse.json();

                        if (updateData.ReturnCode === 200) {
                            showSuccessPopup('Profile image updated successfully');
                        } else {
                            showErrorPopup(updateData.ReturnMsg || 'Failed to update profile image');
                            // Revert the image if the update fails
                            const originalProfileImg = user.profile_img || 'cat';
                            profileImage.src = cartoonUrls[originalProfileImg];
                            highlightSelectedCartoon(originalProfileImg);
                        }
                    } catch (error) {
                        console.error('Error updating profile image:', error);
                        showErrorPopup('Error updating profile image');
                        // Revert the image if the update fails
                        const originalProfileImg = user.profile_img || 'cat';
                        profileImage.src = cartoonUrls[originalProfileImg];
                        highlightSelectedCartoon(originalProfileImg);
                    }
                });
            });
        } else {
            errorDiv.textContent = data.ReturnMsg || 'Failed to load profile data';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        errorDiv.textContent = 'Error loading profile data';
        errorDiv.style.display = 'block';
    }
});