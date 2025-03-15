// public/js/edit-myBook.js
document.addEventListener('DOMContentLoaded', async () => {
    const bookId = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('token');

    // Get all form elements
    const editMyBookForm = document.getElementById('editMyBookForm');
    const myBookName = document.getElementById('myBookName');
    const coverImage = document.getElementById('coverImage');
    const description = document.getElementById('description');
    const myBookType = document.getElementById('myBookType');
    const price = document.getElementById('price');
    const coverPreview = document.querySelector('#coverPreview img');
    const errorDiv = document.getElementById('editMyBookError');
    const successDiv = document.getElementById('editMyBookSuccess');

    // Initialize error handling
    if (!token) {
        if (errorDiv) {
            errorDiv.textContent = 'You must be logged in to edit a book.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    // Handle cover image preview
    if (coverImage) {
        coverImage.addEventListener('input', (e) => {
            const imageUrl = e.target.value;
            if (coverPreview) {
                if (imageUrl) {
                    coverPreview.src = imageUrl;
                    coverPreview.style.display = 'block';

                    // Handle image load error
                    coverPreview.onerror = function () {
                        this.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    };
                } else {
                    coverPreview.src = '';
                    coverPreview.style.display = 'none';
                }
            }
        });
    }

    // Fetch and populate book data
    try {
        const response = await fetch(`/api/book/${bookId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Book Data:', data);

        if (data.ReturnCode === 200) {
            const book = data.Data;

            // Populate form fields
            if (myBookName) myBookName.value = book.bookName || '';
            if (coverImage) coverImage.value = book.coverImage || '';
            if (description) description.value = book.description || '';
            if (myBookType) myBookType.value = book.bookType || 'horror';
            if (price) price.value = book.price || '';

            // Update cover preview
            if (coverPreview && book.coverImage) {
                coverPreview.src = book.coverImage;
                coverPreview.style.display = 'block';
                coverPreview.onerror = function () {
                    this.src = 'https://via.placeholder.com/300x400?text=No+Image';
                };
            }

            if (errorDiv) errorDiv.style.display = 'none';
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.ReturnMsg || 'Failed to load book details.';
                errorDiv.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Error loading book:', err);
        if (errorDiv) {
            errorDiv.textContent = 'Error loading book details.';
            errorDiv.style.display = 'block';
        }
    }

    // Handle form submission
    if (editMyBookForm) {
        editMyBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (errorDiv) errorDiv.style.display = 'none';
            if (successDiv) successDiv.style.display = 'none';

            const formData = {
                bookName: myBookName ? myBookName.value : '',
                coverImage: coverImage ? coverImage.value : '',
                description: description ? description.value : '',
                bookType: myBookType ? myBookType.value : '',
                price: price ? parseFloat(price.value) : 0
            };

            try {
                const response = await fetch(`/api/book/${bookId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    if (successDiv) {
                        successDiv.style.display = 'block';
                        // Redirect after a short delay
                        setTimeout(() => {
                            window.location.href = `/book/${bookId}`;
                        }, 1500);
                    }
                } else {
                    if (errorDiv) {
                        errorDiv.textContent = data.ReturnMsg || 'Failed to update book.';
                        errorDiv.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Error updating book:', err);
                if (errorDiv) {
                    errorDiv.textContent = 'Error updating book.';
                    errorDiv.style.display = 'block';
                }
            }
        });
    }
});