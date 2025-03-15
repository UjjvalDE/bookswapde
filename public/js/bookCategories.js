// Book categories configuration with icons and colors
const bookCategories = [
  { value: 'Fiction', icon: 'fa-book-open', color: '#4CAF50', description: 'Stories from imagination' },
  { value: 'Mystery', icon: 'fa-magnifying-glass', color: '#9C27B0', description: 'Puzzling tales and whodunits' },
  { value: 'Sci-Fi', icon: 'fa-rocket', color: '#2196F3', description: 'Science and future fiction' },
  { value: 'Fantasy', icon: 'fa-dragon', color: '#673AB7', description: 'Magical and mythical stories' },
  { value: 'Non-Fiction', icon: 'fa-graduation-cap', color: '#795548', description: 'Real-world knowledge' },
  { value: 'Biography', icon: 'fa-user', color: '#FF9800', description: 'Life stories' },
  { value: 'Romance', icon: 'fa-heart', color: '#E91E63', description: 'Love and relationships' },
  { value: 'Thriller', icon: 'fa-mask', color: '#F44336', description: 'Suspense and action' },
  { value: 'Horror', icon: 'fa-ghost', color: '#607D8B', description: 'Scary and supernatural' },
  { value: 'Poetry', icon: 'fa-feather', color: '#9E9E9E', description: 'Verses and poems' },
  { value: 'History', icon: 'fa-landmark', color: '#795548', description: 'Past events and civilizations' },
  { value: 'Science', icon: 'fa-flask', color: '#00BCD4', description: 'Scientific topics' }
];

// Function to create the book categories UI
function createBookCategoriesUI(containerId, selectedCategories = [], isProfilePage = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // For profile page, only show selected categories
  const categoriesToShow = isProfilePage
    ? bookCategories.filter(cat => selectedCategories.includes(cat.value))
    : bookCategories;

  container.innerHTML = `
    <div class="book-categories-wrapper">
      <div class="book-categories-grid">
        ${categoriesToShow.map(category => `
          <div class="book-category-card">
            ${!isProfilePage ? `
              <input type="checkbox" 
                     id="category-${category.value}" 
                     name="interestedBooks" 
                     value="${category.value}"
                     class="category-checkbox"
                     ${selectedCategories.includes(category.value) ? 'checked' : ''}>
            ` : ''}
            <div class="category-content" style="--category-color: ${category.color}">
              <div class="category-icon">
                <i class="fas ${category.icon}"></i>
              </div>
              <div class="category-info">
                <span class="category-name">${category.value}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('book-categories-styles')) {
    const style = document.createElement('style');
    style.id = 'book-categories-styles';
    style.textContent = `
      .book-categories-wrapper {
        padding: 1rem;
        border-radius: 12px;
        background: var(--light);
      }

      .book-categories-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .book-category-card {
        position: relative;
      }

      .category-checkbox {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
        z-index: 2;
      }

      .category-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-radius: 10px;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .category-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--light);
        border-radius: 8px;
      }

      .category-icon i {
        font-size: 1.25rem;
        color: var(--category-color);
      }

      .category-info {
        flex: 1;
      }

      .category-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--secondary);
      }

      /* Checkbox states */
      .category-checkbox:checked + .category-content {
        background: var(--category-color);
        border-color: var(--category-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      .category-checkbox:checked + .category-content .category-icon {
        background: rgba(255,255,255,0.2);
      }

      .category-checkbox:checked + .category-content .category-icon i,
      .category-checkbox:checked + .category-content .category-name {
        color: white;
      }

      /* Profile page styles */
      .profile-page .category-content {
        background: var(--category-color);
        border-color: var(--category-color);
      }

      .profile-page .category-icon {
        background: rgba(255,255,255,0.2);
      }

      .profile-page .category-icon i,
      .profile-page .category-name {
        color: white;
      }

      /* Hover effects */
      .category-checkbox:not(:checked) + .category-content:hover {
        border-color: var(--category-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      /* Responsive design */
      @media (max-width: 992px) {
        .book-categories-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 576px) {
        .book-categories-grid {
          grid-template-columns: 1fr;
        }

        .category-content {
          padding: 0.75rem;
        }

        .category-icon {
          width: 36px;
          height: 36px;
        }

        .category-icon i {
          font-size: 1.1rem;
        }

        .category-name {
          font-size: 0.9rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add profile page class if needed
  if (isProfilePage) {
    container.classList.add('profile-page');
  }
}

// Function to get selected categories
function getSelectedCategories(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  return Array.from(container.querySelectorAll('input[name="interestedBooks"]:checked'))
    .map(checkbox => checkbox.value);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { bookCategories, createBookCategoriesUI, getSelectedCategories };
} 