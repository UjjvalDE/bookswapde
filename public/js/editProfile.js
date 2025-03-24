// public/js/edit-profile.js
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

// Add styles for avatar selection
const avatarStyles = `
  .avatar-selection {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .avatar-option {
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
    position: relative;
    transition: all 0.3s ease;
  }

  .avatar-option img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .avatar-option.selected {
    box-shadow: 0 0 0 3px var(--primary);
  }

  .avatar-option:hover img {
    transform: scale(1.1);
  }

  .avatar-option.selected::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--primary);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = avatarStyles;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', async () => {
  const profileImagePreview = document.getElementById('profileImagePreview');
  const profileImageWrapper = document.querySelector('.profile-image-wrapper');
  const nameInput = document.getElementById('name');
  const numberInput = document.getElementById('number');
  const emailInput = document.getElementById('email');
  const interestedBooksDiv = document.getElementById('interestedBooks');
  const cartoonLogoSelect = document.getElementById('cartoonLogo');
  const editProfileForm = document.getElementById('editProfileForm');
  const editProfileError = document.getElementById('editProfileError');
  const token = localStorage.getItem('token');

  // Address related elements
  const cityInput = document.getElementById('city');
  const streetInput = document.getElementById('street');
  const postcodeInput = document.getElementById('postcode');
  const countryInput = document.getElementById('country');
  const citySearch = document.getElementById('city_search');
  const streetSearch = document.getElementById('street_search');
  const citySuggestions = document.getElementById('city_suggestions');
  const streetSuggestions = document.getElementById('street_suggestions');
  const addressFields = document.querySelector('.address-fields');

  let map = null;
  let marker = null;
  let debounceTimer;

  // Initialize map
  function initMap(lat, lon) {
    if (!map) {
      map = L.map('map').setView([lat, lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      marker = L.marker([lat, lon]).addTo(map);
    } else {
      map.setView([lat, lon], 13);
      marker.setLatLng([lat, lon]);
    }
  }

  // Debounce function
  function debounce(func, delay) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Search places using Nominatim
  async function searchPlaces(query, type = 'city') {
    try {
      const baseUrl = 'https://nominatim.openstreetmap.org/search';
      const format = 'json';
      const addressdetails = 1;
      const limit = 5;

      const url = `${baseUrl}?q=${encodeURIComponent(query)}&format=${format}&addressdetails=${addressdetails}&limit=${limit}`;

      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Update suggestions in the dropdown
  function updateSuggestions(results, container, type) {
    container.innerHTML = '';
    container.style.display = results.length ? 'block' : 'none';

    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      div.textContent = type === 'city'
        ? `${result.address.city || result.address.town || result.address.village || result.name}, ${result.address.country}`
        : result.display_name;

      div.addEventListener('click', () => {
        if (type === 'city') {
          citySearch.value = result.address.city || result.address.town || result.address.village || result.name;
          cityInput.value = result.address.city || result.address.town || result.address.village || result.name;
          countryInput.value = result.address.country;
          addressFields.style.display = 'grid';
          initMap(result.lat, result.lon);
        } else {
          streetSearch.value = result.display_name;
          streetInput.value = result.address.road || '';
          postcodeInput.value = result.address.postcode || '';
          initMap(result.lat, result.lon);
        }
        container.style.display = 'none';
      });

      container.appendChild(div);
    });
  }

  // City search handler
  citySearch.addEventListener('input', debounce(async (e) => {
    if (e.target.value.length < 3) return;
    const results = await searchPlaces(e.target.value, 'city');
    updateSuggestions(results, citySuggestions, 'city');
  }, 300));

  // Street search handler
  streetSearch.addEventListener('input', debounce(async (e) => {
    if (e.target.value.length < 3) return;
    const cityName = cityInput.value;
    const results = await searchPlaces(`${e.target.value}, ${cityName}`, 'street');
    updateSuggestions(results, streetSuggestions, 'street');
  }, 300));

  // Close suggestions on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      citySuggestions.style.display = 'none';
      streetSuggestions.style.display = 'none';
    }
  });

  // Book categories with icons
  const bookCategories = [
    { value: 'Fiction', icon: 'fa-book-open', color: '#4CAF50' },
    { value: 'Mystery', icon: 'fa-magnifying-glass', color: '#9C27B0' },
    { value: 'Sci-Fi', icon: 'fa-rocket', color: '#2196F3' },
    { value: 'Fantasy', icon: 'fa-dragon', color: '#673AB7' },
    { value: 'Non-Fiction', icon: 'fa-graduation-cap', color: '#795548' },
    { value: 'Biography', icon: 'fa-user', color: '#FF9800' },
    { value: 'Romance', icon: 'fa-heart', color: '#E91E63' },
    { value: 'Thriller', icon: 'fa-mask', color: '#F44336' },
    { value: 'Horror', icon: 'fa-ghost', color: '#607D8B' },
    { value: 'Poetry', icon: 'fa-feather', color: '#9E9E9E' },
    { value: 'History', icon: 'fa-landmark', color: '#795548' },
    { value: 'Science', icon: 'fa-flask', color: '#00BCD4' }
  ];

  if (!token) {
    editProfileError.textContent = 'You must be logged in to edit your profile.';
    editProfileError.style.display = 'block';
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }

  // Fetch and populate initial data
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

      // Update profile image
      if (profileImagePreview && user.profile_img) {
        profileImagePreview.src = cartoonUrls[user.profile_img] || cartoonUrls.cat;
      }

      // Update form fields with user data
      if (nameInput) nameInput.value = user.name || '';
      if (numberInput) numberInput.value = user.number || '';
      if (emailInput) emailInput.value = user.email || '';

      // Update address fields if available
      if (user.address) {
        const addressParts = user.address.split(',').map(part => part.trim());
        if (addressParts.length >= 3) {
          const [street, city, country] = addressParts;
          if (citySearch) citySearch.value = city;
          if (cityInput) cityInput.value = city;
          if (streetSearch) streetSearch.value = street;
          if (streetInput) streetInput.value = street;
          if (countryInput) countryInput.value = country;
          if (postcodeInput) postcodeInput.value = user.postcode || '';

          // Show address fields
          if (addressFields) addressFields.style.display = 'grid';

          // Initialize map with geocoded address
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(user.address)}&format=json&limit=1`;
          try {
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.length > 0) {
              initMap(geocodeData[0].lat, geocodeData[0].lon);
            }
          } catch (error) {
            console.error('Error geocoding address:', error);
          }
        }
      }

      // Create book categories UI and pre-select user's choices
      if (interestedBooksDiv) {
        createBookCategoriesUI('interestedBooks', user.interestedBooks || [], false);
      }

      // Pre-select cartoon logo
      if (cartoonLogoSelect && user.profile_img) {
        cartoonLogoSelect.value = user.profile_img;
      }

      // Hide error message if everything loaded successfully
      editProfileError.style.display = 'none';
    } else {
      editProfileError.textContent = data.ReturnMsg || 'Failed to load profile data';
      editProfileError.style.display = 'block';
    }
  } catch (error) {
    editProfileError.textContent = 'Error loading profile data. Please try again later.';
    editProfileError.style.display = 'block';
    console.error('Profile fetch error:', error);
  }

  // Form submission
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      editProfileError.style.display = 'none';

      // Get selected book categories
      const selectedBooks = getSelectedCategories('interestedBooks');

      // Construct address string
      const street = streetInput.value;
      const city = cityInput.value;
      const country = countryInput.value;
      const address = `${street}, ${city}, ${country}`;

      const dataToSend = {
        name: nameInput.value,
        number: numberInput.value,
        address: address,
        postcode: postcodeInput.value,
        interestedBooks: selectedBooks,
        profile_img: cartoonLogoSelect.value
      };

      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataToSend)
        });

        const data = await response.json();

        if (data.ReturnCode === 200) {
          // Show success message and redirect
          showSuccessPopup();
          setTimeout(() => {
            window.location.href = '/profile';
          }, 2000);
        } else {
          editProfileError.textContent = data.ReturnMsg || 'Failed to update profile';
          editProfileError.style.display = 'block';
        }
      } catch (error) {
        editProfileError.textContent = 'Error updating profile. Please try again.';
        editProfileError.style.display = 'block';
        console.error('Update error:', error);
      }
    });
  }

  // Create success popup element and styles
  const popupStyles = document.createElement('style');
  popupStyles.textContent = `
    .success-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(150%);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      z-index: 1000;
    }

    .success-popup.show {
      transform: translateX(0);
      opacity: 1;
    }

    .success-popup i {
      font-size: 24px;
      animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .success-popup .popup-content {
      display: flex;
      flex-direction: column;
    }

    .success-popup .popup-title {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 4px;
    }

    .success-popup .popup-message {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    @keyframes bounceIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
      .success-popup {
        top: auto;
        bottom: 20px;
        right: 20px;
        left: 20px;
        transform: translateY(150%);
      }

      .success-popup.show {
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(popupStyles);

  // Function to show success popup
  function showSuccessPopup() {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'success-popup';
    popup.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <div class="popup-content">
        <div class="popup-title">Success!</div>
        <div class="popup-message">Your profile has been updated</div>
      </div>
    `;

    // Add popup to document
    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(() => {
      popup.classList.add('show');
    }, 100);

    // Remove popup after animation
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.remove();
      }, 500);
    }, 1500);
  }

  // Create avatar selection container
  const avatarSelectionContainer = document.createElement('div');
  avatarSelectionContainer.className = 'avatar-selection';

  // Create avatar options
  Object.entries(cartoonUrls).forEach(([key, url]) => {
    const avatarOption = document.createElement('div');
    avatarOption.className = 'avatar-option';
    avatarOption.innerHTML = `<img src="${url}" alt="${key} avatar">`;

    avatarOption.addEventListener('click', () => {
      // Remove selected class from all options
      document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
      });

      // Add selected class to clicked option
      avatarOption.classList.add('selected');

      // Update profile image preview and hidden input
      if (profileImagePreview) {
        profileImagePreview.src = url;
      }
      if (cartoonLogoSelect) {
        cartoonLogoSelect.value = key;
      }
    });

    avatarSelectionContainer.appendChild(avatarOption);
  });

  // Insert avatar selection after profile image wrapper
  if (profileImageWrapper) {
    profileImageWrapper.parentNode.insertBefore(avatarSelectionContainer, profileImageWrapper.nextSibling);
  }

  // When loading user data, mark the current avatar as selected
  const response = await fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const userData = await response.json();
    if (userData.profileImage) {
      const currentAvatar = Object.entries(cartoonUrls).find(([_, url]) => url === userData.profileImage);
      if (currentAvatar) {
        const avatarOption = Array.from(document.querySelectorAll('.avatar-option'))
          .find(option => option.querySelector('img').src === userData.profileImage);
        if (avatarOption) {
          avatarOption.classList.add('selected');
        }
      }
    }
  }
});