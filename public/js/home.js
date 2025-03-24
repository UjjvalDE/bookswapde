// public/js/home.js
document.addEventListener('DOMContentLoaded', () => {
  let isLoggedIn = localStorage.getItem("token");

  if (!isLoggedIn) {
    // Create and show modern notification popup
    const notification = document.createElement('div');
    notification.className = 'auth-popup';
    notification.innerHTML = `
      <div class="auth-popup-content">
        <div class="auth-popup-header">
          <div class="auth-popup-icon">
            <i class="fas fa-lock"></i>
          </div>
          <button class="auth-popup-close" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="auth-popup-text">
          <h3 class="auth-popup-title">Welcome to BookSwap</h3>
          <p class="auth-popup-message">Please sign in to explore our book collection and start swapping!</p>
        </div>
        <div class="auth-popup-buttons">
          <a href="/login" class="auth-popup-btn login">
            <i class="fas fa-sign-in-alt"></i>
            Sign In
          </a>
          <a href="/signup" class="auth-popup-btn signup">Sign Up</a>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Show popup with a slight delay for smooth animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Handle close button
    const closeBtn = notification.querySelector('.auth-popup-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
        window.location.href = "/login";
      }, 500);
    });

    // Auto redirect after 3 seconds if popup isn't closed
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.remove();
          window.location.href = "/login";
        }, 500);
      }
    }, 3000);

    return;
  }

  // If logged in, initialize the page
  const myBooksContainer = document.getElementById('myBooksContainer');
  const errorDiv = document.getElementById('myBooksError');
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const priceFilter = document.getElementById('priceFilter');
  const applyFiltersBtn = document.getElementById('applyFilters');
  const clearFiltersBtn = document.getElementById('clearFilters');

  async function fetchBooks(filters = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      if (errorDiv) {
        errorDiv.textContent = 'You must be logged in to view books.';
        errorDiv.style.display = 'block';
      }
      window.location.href = '/login';
      return;
    }

    try {
      // Construct the price filter in the format the backend expects (e.g., "0-5", "0-0", "15+")
      let priceValue = filters.price || '';

      const queryParams = new URLSearchParams({
        search: filters.search || '',
        type: filters.type || '',
        price: priceValue // Send the price as a single string (e.g., "0-5", "0-0", "15+")
      }).toString();

      console.log('Fetching books with query:', queryParams); // Debug log

      const response = await fetch(`/api/allBook?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.ReturnCode === 200 && Array.isArray(data.Data)) {
        // Filter out unavailable books
        const availableBooks = data.Data.filter(book => book.available);

        if (availableBooks.length === 0) {
          myBooksContainer.innerHTML = `
            <div class="no-books-message">
              <i class="fas fa-book"></i>
              <p>No available books found</p>
            </div>
          `;
        } else {
          myBooksContainer.innerHTML = availableBooks.map(book => createBookCard(book)).join('');
        }
        if (errorDiv) errorDiv.style.display = 'none';
      } else {
        if (errorDiv) {
          errorDiv.textContent = data.ReturnMsg || 'Failed to load books.';
          errorDiv.style.display = 'block';
        }
        // If token is expired, redirect to login
        if (data.ReturnCode === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    } catch (err) {
      console.error('Error loading books:', err);
      if (errorDiv) {
        errorDiv.textContent = 'Error loading books.';
        errorDiv.style.display = 'block';
      }
    }
  }

  function createBookCard(book) {
    return `
      <a href="/book/${book._id}" class="book-card">
        <img src="${book.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}" 
          alt="${book.bookName}" 
          class="book-image"
          onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
        <div class="book-info">
          <div>
            <h3 class="book-title">${book.bookName}</h3>
            <div class="book-details">
              <span class="book-tag">${book.bookType}</span>
              <span class="book-price">${book.price === 0 ? 'Free' : `€${book.price.toFixed(2)}`}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  // Load books when the page loads
  fetchBooks();

  // Apply filters when the button is clicked
  applyFiltersBtn.addEventListener('click', () => {
    const filters = {
      search: searchInput.value,
      type: typeFilter.value,
      price: priceFilter.value
    };
    fetchBooks(filters);
  });

  // Clear filters and fetch all books when the button is clicked
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      // Reset all filter inputs
      searchInput.value = ''; // Clear the search input field
      typeFilter.value = '';  // Reset the type filter dropdown
      priceFilter.value = ''; // Reset the price filter dropdown

      console.log('Filters cleared:', {
        search: searchInput.value,
        type: typeFilter.value,
        price: priceFilter.value
      }); // Debug log

      // Fetch all books with no filters
      fetchBooks({});
    });
  }
});