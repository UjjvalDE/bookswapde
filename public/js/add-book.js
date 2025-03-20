// public/js/add-book.js
// Preview cover image when URL is manually entered
document.getElementById('coverImage').addEventListener('input', (e) => {
  const coverImageUrl = e.target.value.trim();
  const coverPreview = document.getElementById('coverPreview');
  const previewImg = coverPreview.querySelector('img');

  if (coverImageUrl) {
    previewImg.src = coverImageUrl;
    previewImg.onload = function () {
      coverPreview.style.display = 'block';
    };
    previewImg.onerror = function () {
      coverPreview.style.display = 'none';
    };
  } else {
    coverPreview.style.display = 'none';
    previewImg.src = '';
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
  const coverPreview = document.getElementById('coverPreview');

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
      body: JSON.stringify({
        bookName,
        coverImage,
        description,
        bookType,
        price: price || 0
      })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.style.display = 'block';
      errorDiv.style.display = 'none';
      document.getElementById('addBookForm').reset();
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
  const coverPreview = document.getElementById('coverPreview');
  const previewImg = coverPreview.querySelector('img');

  if (!bookName.trim()) {
    errorDiv.textContent = 'Please enter a book name first.';
    errorDiv.style.display = 'block';
    return;
  }

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

      price.value = 0;

      // Update image preview
      if (coverImage.value) {
        previewImg.src = coverImage.value;
        previewImg.onload = function () {
          coverPreview.style.display = 'block';
        };
        previewImg.onerror = function () {
          coverPreview.style.display = 'none';
        };
      } else {
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

// Image upload handling
document.getElementById('uploadImageBtn').addEventListener('click', () => {
  document.getElementById('imageUpload').click();
});

document.getElementById('imageUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    const errorDiv = document.getElementById('addBookError');
    errorDiv.textContent = 'Please select an image file.';
    errorDiv.style.display = 'block';
    return;
  }

  // Show loading state
  const uploadBtn = document.getElementById('uploadImageBtn');
  const originalBtnText = uploadBtn.innerHTML;
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  uploadBtn.disabled = true;

  try {
    // Get upload URL from server
    const token = localStorage.getItem('token');
    const urlResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type
      })
    });

    if (!urlResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, fileUrl } = await urlResponse.json();

    // Upload file to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    // Update cover image URL input and preview
    const coverImage = document.getElementById('coverImage');
    coverImage.value = fileUrl;

    // Trigger the preview update
    const previewEvent = new Event('input', { bubbles: true });
    coverImage.dispatchEvent(previewEvent);

    // Reset upload button
    uploadBtn.innerHTML = originalBtnText;
    uploadBtn.disabled = false;

    // Hide any error messages
    const errorDiv = document.getElementById('addBookError');
    errorDiv.style.display = 'none';

  } catch (error) {
    console.error('Upload error:', error);
    const errorDiv = document.getElementById('addBookError');
    errorDiv.textContent = 'Failed to upload image. Please try again.';
    errorDiv.style.display = 'block';

    // Reset upload button
    uploadBtn.innerHTML = originalBtnText;
    uploadBtn.disabled = false;
  }
});
