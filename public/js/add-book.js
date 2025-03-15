// public/js/add-book.js
// Preview cover image when URL is manually entered
document.getElementById('coverImage').addEventListener('input', (e) => {
  const coverImageUrl = e.target.value;
  const coverPreview = document.querySelector('#coverPreview img');
  const previewOverlay = document.querySelector('.preview-overlay');

  if (coverImageUrl) {
    coverPreview.src = coverImageUrl;
    coverPreview.style.display = 'block';
    previewOverlay.style.opacity = '0';

    // Add error handling for image loading
    coverPreview.onerror = function () {
      this.src = 'https://via.placeholder.com/300x400?text=No+Image+Available';
      previewOverlay.style.opacity = '1';
    };

    coverPreview.onload = function () {
      previewOverlay.style.opacity = '0';
    };
  } else {
    coverPreview.src = '';
    coverPreview.style.display = 'none';
    previewOverlay.style.opacity = '1';
  }
});

document.getElementById('addBookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bookName = document.getElementById('bookName').value;
  const coverImage = document.getElementById('coverImage').value;
  const description = document.getElementById('description').value;
  const bookType = document.getElementById('bookType').value;
  const price = document.getElementById('price').value;
  const errorDiv = document.getElementById('addBookError');
  const successDiv = document.getElementById('addBookSuccess');
  const coverPreview = document.querySelector('#coverPreview img');

  const token = localStorage.getItem('token');

  if (!token) {
    errorDiv.textContent = 'You must be logged in to add a book.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/add-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookName, coverImage, description, bookType, price })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.style.display = 'block';
      errorDiv.style.display = 'none';
      document.getElementById('addBookForm').reset();
      coverPreview.src = '';
      coverPreview.style.display = 'none';
    } else {
      errorDiv.textContent = data.message || 'Failed to add book.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error adding book.';
    errorDiv.style.display = 'block';
    console.error('Add book error:', err);
  }
});

async function autofill() {
  const bookName = document.getElementById('bookName').value;
  const coverImage = document.getElementById('coverImage');
  const description = document.getElementById('description');
  const bookType = document.getElementById('bookType');
  const price = document.getElementById('price');
  const errorDiv = document.getElementById('addBookError');
  const successDiv = document.getElementById('addBookSuccess');
  const coverPreview = document.querySelector('#coverPreview img');

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookName)}`
    );
    const data = await response.json();

    if (data.items) {
      const book = data.items[0].volumeInfo;
      document.getElementById('bookName').value = book.title || bookName;
      coverImage.value = book.imageLinks?.thumbnail || '';
      description.value = book.description || '';

      const categoryMap = {
        'fantasy': 'fantasy',
        'science fiction': 'sci-fi',
        'mystery': 'mystery',
        'thriller': 'thriller',
        'horror': 'horror',
        'romance': 'romance'
      };
      const category = book.categories?.[0]?.toLowerCase() || '';
      bookType.value = Object.keys(categoryMap).find(key => category.includes(key)) || '';

      price.value = book.saleInfo?.listPrice?.amount || 10.00;

      // Update image preview
      if (coverImage.value) {
        coverPreview.src = coverImage.value;
        coverPreview.style.display = 'block';

        // Add error handling for image loading
        coverPreview.onerror = function () {
          this.src = 'https://via.placeholder.com/300x400?text=No+Image+Available';
        };
      } else {
        coverPreview.src = '';
        coverPreview.style.display = 'none';
      }

      errorDiv.style.display = 'none';
    } else {
      errorDiv.textContent = 'No matching books found. Enter details manually.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error fetching book details.';
    errorDiv.style.display = 'block';
    console.error('Google Books API error:', err);
  }
}
