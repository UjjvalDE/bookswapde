// public/js/myBook.js
document.addEventListener('DOMContentLoaded', async () => {
  const myBookContainer = document.getElementById('myBookContainer');
  const errorDiv = document.getElementById('myBookError');
  const token = localStorage.getItem('token');

  if (!token) {
    errorDiv.textContent = 'You must be logged in to view your books.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/myBook', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.ReturnCode === 200) {
      if (data.Data.length === 0) {
        myBookContainer.innerHTML = `
          <div class="no-books-message">
            <i class="fas fa-book-open"></i>
            <h3>No Books Available</h3>
            <p>You haven't added any books to your collection yet.</p>
            <a href="/add-book" class="add-book-link">
              <i class="fas fa-plus"></i>
              Add Your First Book
            </a>
          </div>
        `;
      } else {
        data.Data.forEach(book => {
          const myBookCard = createBookCard(book);
          myBookContainer.innerHTML += myBookCard;
        });
      }
      errorDiv.style.display = 'none';
    } else {
      errorDiv.textContent = data.ReturnMsg || 'No books available.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    console.error('myBook fetch error:', err);
    errorDiv.textContent = 'No books available.';
    errorDiv.style.display = 'block';
  }
});

function createBookCard(book) {
  return `
    <div class="book-card ${book.available ? 'available' : 'unavailable'}" data-book-id="${book._id}">
      <a href="/book/${book._id}" class="book-card-link">
        <img src="${book.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}" 
          alt="${book.bookName}" 
          class="book-image"
          onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
        <div class="book-info">
          <div>
            <h3 class="book-title">${book.bookName}</h3>
            <div class="book-details">
              <span class="book-tag">${book.bookType}</span>
              <span class="book-price">€${book.price.toFixed(2)}</span>
            </div>
          </div>
          <div class="status-badge ${book.available ? 'available' : 'unavailable'}">
            <i class="fas ${book.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${book.available ? 'Available' : 'Unavailable'}
          </div>
        </div>
      </a>
      <div class="book-actions">
        <button onclick="toggleAvailability('${book._id}', ${!book.available})" 
          class="action-btn availability-btn ${book.available ? 'available' : 'unavailable'}" 
          title="${book.available ? 'Mark as Unavailable' : 'Mark as Available'}">
          <i class="fas ${book.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        </button>
        <a href="/edit-myBook/${book._id}" class="action-btn edit-btn" title="Edit Book">
          <i class="fas fa-edit"></i>
        </a>
        <button onclick="deleteBook('${book._id}')" class="action-btn delete-btn" title="Delete Book">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Add toggle availability functionality
async function toggleAvailability(bookId, newAvailability) {
  try {
    const response = await fetch(`/api/book/${bookId}/availability`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ available: newAvailability })
    });

    if (response.ok) {
      // Find the book card element
      const bookCard = document.querySelector(`.book-card[data-book-id="${bookId}"]`);
      if (bookCard) {
        // Update the book card class
        bookCard.classList.remove('available', 'unavailable');
        bookCard.classList.add(newAvailability ? 'available' : 'unavailable');

        // Update the status badge
        const statusBadge = bookCard.querySelector('.status-badge');
        if (statusBadge) {
          statusBadge.className = `status-badge ${newAvailability ? 'available' : 'unavailable'}`;
          statusBadge.innerHTML = `
            <i class="fas ${newAvailability ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            ${newAvailability ? 'Available' : 'Unavailable'}
          `;
        }

        // Update the availability button
        const availabilityBtn = bookCard.querySelector('.availability-btn');
        if (availabilityBtn) {
          availabilityBtn.className = `action-btn availability-btn ${newAvailability ? 'available' : 'unavailable'}`;
          availabilityBtn.title = newAvailability ? 'Mark as Unavailable' : 'Mark as Available';
          availabilityBtn.innerHTML = `<i class="fas ${newAvailability ? 'fa-check-circle' : 'fa-times-circle'}"></i>`;
          availabilityBtn.onclick = () => toggleAvailability(bookId, !newAvailability);
        }

        // Update the image grayscale effect
        const bookImage = bookCard.querySelector('.book-image');
        if (bookImage) {
          bookImage.style.filter = newAvailability ? 'none' : 'grayscale(0.7)';
        }
      }
    } else {
      const data = await response.json();
      showErrorPopup(data.ReturnMsg || 'Failed to update book availability');
    }
  } catch (err) {
    console.error('Update availability error:', err);
    showErrorPopup('Error updating book availability');
  }
}

// Add delete functionality
async function deleteBook(bookId) {
  showConfirmationModal(bookId);
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .modal-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    width: 90%;
    max-width: 400px;
    transform: scale(0.7);
    transition: all 0.3s ease;
    text-align: center;
  }

  .modal-overlay.show .modal-content {
    transform: scale(1);
  }

  .modal-icon {
    font-size: 3rem;
    color: #f56565;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .modal-message {
    color: #4a5568;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  .modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    font-size: 0.95rem;
  }

  .modal-btn.cancel {
    background: #e2e8f0;
    color: #4a5568;
  }

  .modal-btn.cancel:hover {
    background: #cbd5e0;
  }

  .modal-btn.delete {
    background: #f56565;
    color: white;
  }

  .modal-btn.delete:hover {
    background: #e53e3e;
  }
`;
document.head.appendChild(modalStyles);

// Function to show confirmation modal
function showConfirmationModal(bookId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <i class="fas fa-trash-alt modal-icon"></i>
      <h2 class="modal-title">Delete Book</h2>
      <p class="modal-message">Are you sure you want to delete this book?</p>
      <div class="modal-buttons">
        <button class="modal-btn cancel">Cancel</button>
        <button class="modal-btn delete">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 50);

  const cancelBtn = modal.querySelector('.cancel');
  const deleteBtn = modal.querySelector('.delete');

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });

  deleteBtn.addEventListener('click', async () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/book/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showDeletePopup();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const data = await response.json();
        showErrorPopup('Failed to delete book');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showErrorPopup('Error deleting book');
    }
  });
}

// Function to show success popup
function showDeletePopup() {
  const popup = document.createElement('div');
  popup.className = 'popup success';
  popup.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <div class="popup-content">
      <div class="popup-title">Success!</div>
      <div class="popup-message">Book has been deleted</div>
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