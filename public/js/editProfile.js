// public/js/edit-profile.js
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