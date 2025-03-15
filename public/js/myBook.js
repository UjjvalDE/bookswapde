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
        data.Data.forEach(Data => {
          const myBookCard = createBookCard(Data);
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
      <div class="book-image-wrapper">
        <img src="${book.coverImage || 'https://via.placeholder.com/300x400?text=No+Image'}" 
          alt="${book.bookName}" 
          class="book-image"
          onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
        <div class="book-overlay">
          <div class="action-buttons">
            <a href="/book/${book._id}" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </a>
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
        <div class="status-badge ${book.available ? 'available' : 'unavailable'}">
          <i class="fas ${book.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          ${book.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.bookName}</h3>
        <div class="book-meta">
          <span class="book-type">
            <i class="fas fa-book"></i>
            ${book.bookType}
          </span>
          <span class="book-price">
            <i class="fas fa-tag"></i>
            €${book.price}
          </span>
        </div>
      </div>
    </div>
  `;
}

// Update the styles
const styles = `
  #myBookContainer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .no-books-message {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--white);
    border-radius: 15px;
    box-shadow: var(--shadow);
    grid-column: 1 / -1;
  }

  .no-books-message i {
    font-size: 4rem;
    color: var(--primary);
    margin-bottom: 1.5rem;
  }

  .no-books-message h3 {
    font-size: 1.75rem;
    color: var(--secondary);
    margin-bottom: 1rem;
  }

  .no-books-message p {
    color: var(--accent);
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .add-book-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--primary);
    color: var(--white);
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .add-book-link:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  .book-card {
    background: var(--white);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 400px;
  }

  .book-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
  }

  .book-image-wrapper {
    position: relative;
    height: 320px;
    overflow: hidden;
    background: #f3f4f6;
  }

  .book-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  .book-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .book-card:hover .book-overlay {
    opacity: 1;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .book-card:hover .action-buttons {
    transform: translateY(0);
    opacity: 1;
  }

  .action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--white);
    color: var(--secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .action-btn:hover {
    transform: scale(1.1);
  }

  .view-btn:hover {
    background: var(--primary);
    color: var(--white);
  }

  .edit-btn:hover {
    background: #4299e1;
    color: white;
  }

  .delete-btn:hover {
    background: #e53e3e;
    color: white;
  }

  .availability-btn.available {
    color: #48bb78;
  }

  .availability-btn.unavailable {
    color: #e53e3e;
  }

  .availability-btn:hover {
    background: #48bb78;
    color: white;
  }

  .status-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
  }

  .status-badge.available {
    background: rgba(72, 187, 120, 0.9);
    color: white;
  }

  .status-badge.unavailable {
    background: rgba(229, 62, 62, 0.9);
    color: white;
  }

  .book-info {
    padding: 1rem;
    background: var(--white);
    flex: 1;
  }

  .book-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--secondary);
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-meta {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .book-type,
  .book-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--accent);
    padding: 0.25rem 0.75rem;
    background: var(--light);
    border-radius: 20px;
  }

  @media (max-width: 1200px) {
    .book-card {
      height: 380px;
    }

    .book-image-wrapper {
      height: 300px;
    }
  }

  @media (max-width: 768px) {
    .book-card {
      height: 360px;
    }

    .book-image-wrapper {
      height: 280px;
    }

    .book-info {
      padding: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .book-card {
      height: 340px;
    }

    .book-image-wrapper {
      height: 260px;
    }

    .book-info {
      padding: 0.75rem;
    }

    .book-title {
      font-size: 0.9rem;
      margin-bottom: 0.4rem;
    }

    .book-type,
    .book-price {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
    }
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

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
        bookCard.classList.toggle('available', newAvailability);
        bookCard.classList.toggle('unavailable', !newAvailability);

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
          availabilityBtn.title = newAvailability ? 'Mark as Unavailable' : 'Mark as Available';
          availabilityBtn.className = `availability-btn ${newAvailability ? 'available' : 'unavailable'}`;
          availabilityBtn.onclick = () => toggleAvailability(bookId, !newAvailability);
        }

        // Update the image grayscale effect
        const bookImage = bookCard.querySelector('.book-image');
        if (bookImage) {
          bookImage.style.filter = newAvailability ? 'none' : 'grayscale(0.5)';
        }
      }
    } else {
      const data = await response.json();
      alert(data.ReturnMsg || 'Failed to update book availability');
    }
  } catch (err) {
    console.error('Update availability error:', err);
    alert('Error updating book availability');
  }
}

