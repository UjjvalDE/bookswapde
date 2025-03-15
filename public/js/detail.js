var bookId = window.location.pathname.split('/').pop()
var token = localStorage.getItem('token');
// public/js/myBook-detail.js
document.addEventListener('DOMContentLoaded', async () => {
  const myBookName = document.getElementById('myBookName');
  const myBookCover = document.getElementById('myBookCover');
  const myBookType = document.getElementById('myBookType');
  const myBookPrice = document.getElementById('myBookPrice');
  const myBookDescription = document.getElementById('myBookDescription');
  const errorDiv = document.getElementById('myBookError');
  const bookOwnerName = document.getElementById('bookOwnerName');
  const bookOwnerEmail = document.getElementById('bookOwnerEmail');
  const bookOwnerPhone = document.getElementById('bookOwnerPhone');
  const bookOwnerAddress = document.getElementById('bookOwnerAddress');
  const adminDiv = document.getElementById("admin");
  const common = document.getElementById("common");
  const ownerSection = document.querySelector(".owner-section");
  const distanceLabel = document.getElementById('distanceLabel');
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([0, 0]),
      zoom: 2
    })
  });

  // Initialize hidden states
  if (adminDiv) adminDiv.style.display = 'none';
  if (common) common.style.display = 'none';
  if (ownerSection) ownerSection.style.display = 'none';

  if (!token) {
    if (errorDiv) {
      errorDiv.textContent = 'You must be logged in to view book details.';
      errorDiv.style.display = 'block';
    }
    return;
  }

  try {
    const response = await fetch(`/api/book/${bookId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.ReturnCode === 200) {
      const myBook = data.Data;
      console.log('Book Data:', myBook);

      // Update book details
      if (myBookName) myBookName.textContent = myBook.bookName || 'Untitled Book';
      if (myBookCover) {
        myBookCover.src = myBook.coverImage || 'https://via.placeholder.com/300x400?text=No+Image';
        myBookCover.onerror = function () {
          this.src = 'https://via.placeholder.com/300x400?text=No+Image';
        };
      }
      if (myBookType) myBookType.textContent = myBook.bookType || 'Unknown Type';
      if (myBookPrice) myBookPrice.textContent = `€${(myBook.price || 0).toFixed(2)}`;
      if (myBookDescription) myBookDescription.textContent = myBook.description || 'No description available.';

      // Check if user is admin/owner
      const isAdmin = myBook.admin === true;
      console.log('Is Admin:', isAdmin);

      if (isAdmin) {
        // User is the owner - show edit/delete buttons
        if (adminDiv) {
          adminDiv.style.display = 'flex';
          adminDiv.style.gap = '1rem';
          adminDiv.style.marginTop = '1rem';

          // Add availability toggle button
          const availabilityBtn = document.createElement('button');
          availabilityBtn.className = `btn ${myBook.available ? 'btn-success' : 'btn-warning'}`;
          availabilityBtn.innerHTML = `
            <i class="fas ${myBook.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>${myBook.available ? 'Mark as Unavailable' : 'Mark as Available'}</span>
          `;
          availabilityBtn.onclick = () => toggleAvailability(myBook._id, !myBook.available);
          adminDiv.appendChild(availabilityBtn);
        }
        if (common) common.style.display = 'flex';
        if (ownerSection) ownerSection.style.display = 'none';

        // Setup delete functionality
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
          deleteBtn.onclick = () => deleteBook();
        }

        // Setup edit functionality
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
          editBtn.onclick = () => editBook();
        }
      } else {
        // User is not the owner - show owner details and map
        if (adminDiv) adminDiv.style.display = 'none';
        if (common) common.style.display = 'flex';
        if (ownerSection) ownerSection.style.display = 'block';

        // Update owner details
        if (bookOwnerName) bookOwnerName.textContent = myBook.sellerData?.name || 'Not available';
        if (bookOwnerEmail) bookOwnerEmail.textContent = myBook.sellerData?.email || 'Not available';
        if (bookOwnerPhone) bookOwnerPhone.textContent = myBook.sellerData?.number || 'Not available';
        if (bookOwnerAddress) bookOwnerAddress.textContent = myBook.sellerData?.address || 'Not available';

        // Calculate distance and show map if postcodes are available
        if (myBook.userData?.postcode && myBook.sellerData?.postcode) {
          calculateDistanceAndShowMap(myBook.userData.postcode, myBook.sellerData.postcode, map, distanceLabel);
        } else {
          if (distanceLabel) distanceLabel.textContent = 'Distance information not available';
        }

        // Set up the contact owner button after owner details are loaded
        setupContactOwner();
      }

      // Show online details for all users
      onlineDetail(myBook);

      if (errorDiv) errorDiv.style.display = 'none';
    } else {
      if (errorDiv) {
        errorDiv.textContent = data.ReturnMsg || 'Failed to load book details.';
        errorDiv.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Book detail error:', err);
    if (errorDiv) {
      errorDiv.textContent = 'Error loading book details.';
      errorDiv.style.display = 'block';
    }
  }
});

async function onlineDetail(myBook) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(myBook.bookName)}`, {
      method: 'GET'
    });

    const onlineBookView = await response.json();
    console.log('Online book data:', onlineBookView);

    const reviewsContainer = document.getElementById("reviewsContainer");
    if (!reviewsContainer) return;

    if (onlineBookView.items && onlineBookView.items.length > 0) {
      const bookInfo = onlineBookView.items[0].volumeInfo;
      let htmlContent = '<div class="online-details">';

      // Add book cover if available
      if (bookInfo.imageLinks && bookInfo.imageLinks.thumbnail) {
        htmlContent += `
          <div class="online-cover">
            <img src="${bookInfo.imageLinks.thumbnail}" alt="Online book cover">
          </div>
        `;
      }

      // Add book details
      htmlContent += '<div class="online-info">';

      // Title
      if (bookInfo.title) {
        htmlContent += `<h3>${bookInfo.title}</h3>`;
      }

      // Authors
      if (bookInfo.authors && bookInfo.authors.length > 0) {
        htmlContent += `<p><strong>Authors:</strong> ${bookInfo.authors.join(', ')}</p>`;
      }

      // Publisher and published date
      if (bookInfo.publisher || bookInfo.publishedDate) {
        htmlContent += `<p><strong>Published:</strong> ${bookInfo.publisher ? bookInfo.publisher : ''} ${bookInfo.publishedDate ? `(${bookInfo.publishedDate})` : ''}</p>`;
      }

      // Description
      if (bookInfo.description) {
        htmlContent += `<p><strong>Description:</strong> ${bookInfo.description}</p>`;
      }

      // Categories
      if (bookInfo.categories && bookInfo.categories.length > 0) {
        htmlContent += `<p><strong>Categories:</strong> ${bookInfo.categories.join(', ')}</p>`;
      }

      // Average rating
      if (bookInfo.averageRating) {
        htmlContent += `<p><strong>Rating:</strong> ${bookInfo.averageRating}/5 (${bookInfo.ratingsCount || 0} ratings)</p>`;
      }

      // Preview link
      if (bookInfo.previewLink) {
        htmlContent += `<p><a href="${bookInfo.previewLink}" target="_blank" class="preview-link">Preview Book</a></p>`;
      }

      htmlContent += '</div></div>';
      reviewsContainer.innerHTML = htmlContent;
    } else {
      reviewsContainer.innerHTML = '<p>No additional online information available for this book.</p>';
    }
  } catch (err) {
    console.error('Error fetching online book details:', err);
    const reviewsContainer = document.getElementById("reviewsContainer");
    if (reviewsContainer) {
      reviewsContainer.innerHTML = '<p>Unable to load online book information.</p>';
    }
  }
}

async function editBook() {
  window.location.href = `/edit-myBook/${bookId}`;
}

async function deleteBook() {
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  deleteModal.show();

  document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
      const response = await fetch(`/api/book/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        window.location.href = '/'; // Redirect after successful deletion
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete book');
      }
    } catch (err) {
      alert('Error deleting book');
      console.error('Delete error:', err);
    } finally {
      // Hide the modal after operation
      const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
      deleteModal.hide();
    }
  });
}

// Add toggle availability function
async function toggleAvailability(bookId, newAvailability) {
  try {
    const response = await fetch(`/api/book/${bookId}/availability`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ available: newAvailability })
    });

    if (response.ok) {
      // Update the availability button
      const availabilityBtn = document.querySelector('.btn-availability');
      if (availabilityBtn) {
        availabilityBtn.className = `btn btn-availability ${newAvailability ? 'btn-success' : 'btn-warning'}`;
        availabilityBtn.innerHTML = `
          <i class="fas ${newAvailability ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          <span>${newAvailability ? 'Mark as Unavailable' : 'Mark as Available'}</span>
        `;
        availabilityBtn.onclick = () => toggleAvailability(bookId, !newAvailability);
      }

      // Add a status indicator near the book title if it doesn't exist
      let statusIndicator = document.querySelector('.book-status-indicator');
      if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.className = 'book-status-indicator';
        const bookTitle = document.querySelector('.book-title');
        if (bookTitle && bookTitle.parentNode) {
          bookTitle.parentNode.insertBefore(statusIndicator, bookTitle.nextSibling);
        }
      }

      // Update the status indicator
      if (statusIndicator) {
        statusIndicator.className = `book-status-indicator ${newAvailability ? 'available' : 'unavailable'}`;
        statusIndicator.innerHTML = `
          <i class="fas ${newAvailability ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          ${newAvailability ? 'Available' : 'Unavailable'}
        `;
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

function calculateDistanceAndShowMap(buyerPostalCode, sellerPostalCode, map, distanceLabel) {
  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(buyerPostalCode)}`)
      .then(response => response.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sellerPostalCode)}`)
      .then(response => response.json())
  ])
    .then(([buyerData, sellerData]) => {
      if (buyerData.length > 0 && sellerData.length > 0) {
        const buyerLat = parseFloat(buyerData[0].lat);
        const buyerLon = parseFloat(buyerData[0].lon);
        const sellerLat = parseFloat(sellerData[0].lat);
        const sellerLon = parseFloat(sellerData[0].lon);

        // Haversine formula to calculate distance (in kilometers)
        const R = 6371; // Earth's radius in kilometers
        const dLat = (sellerLat - buyerLat) * Math.PI / 180;
        const dLon = (sellerLon - buyerLon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(buyerLat * Math.PI / 180) * Math.cos(sellerLat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        distanceLabel.textContent = `How far from seller: ${distance.toFixed(2)} km`;

        // Update map
        const buyerCoords = ol.proj.fromLonLat([buyerLon, buyerLat]);
        const sellerCoords = ol.proj.fromLonLat([sellerLon, sellerLat]);

        const layer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: new ol.geom.Point(buyerCoords),
                name: 'Your Location'
              }),
              new ol.Feature({
                geometry: new ol.geom.Point(sellerCoords),
                name: 'Seller Location'
              })
            ]
          }),
          style: new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({ color: buyerCoords === sellerCoords ? '#ffcc00' : '#2980b9' }), // Blue for buyer, yellow if same
              stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
          })
        });
        map.addLayer(layer);

        const extent = ol.extent.boundingExtent([buyerCoords, sellerCoords]);
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      } else {
        distanceLabel.textContent = 'How far from seller: Unable to locate';
      }
    })
    .catch(err => {
      distanceLabel.textContent = 'How far from seller: Error calculating';
      console.error('Nominatim API error:', err);
    });
}

function renderJSON(data) {
  let htmlContent = '';

  // Loop through the keys of the JSON object
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];

      // Check if the value is an object (nested data)
      if (typeof value === 'object' && !Array.isArray(value)) {
        htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4><div style="margin-left: 20px;">${renderJSON(value)}</div></div></div>`;
      } else if (Array.isArray(value)) {
        // Check if the array is for image links
        if (key === 'imageLinks') {
          htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4></div></div>`;
          value.forEach(imgUrl => {
            htmlContent += `
              <div class="row">
                <div class="col-md-3">
                  <img src="${imgUrl}" alt="Image" class="img-fluid">
                </div>
              </div>
            `;
          });
        } else {
          htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4><ul style="margin-left: 20px;">`;
          value.forEach(item => {
            if (typeof item === 'string' || typeof item === 'number') {
              htmlContent += `<li>${item}</li>`;
            } else if (typeof item === 'object') {
              htmlContent += `<li>${renderJSON(item)}</li>`;
            }
          });
          htmlContent += `</ul></div></div>`;
        }
      } else {
        // For other primitive data types, display them as key-value pairs
        htmlContent += `<div class="row"><div class="col-md-12"><p><span class="key">${key}:</span> ${value}</p></div></div>`;
      }
    }
  }
  return htmlContent;
}

function formatKey(key) {
  return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
}

function setupContactOwner() {
  const contactOwnerBtn = document.querySelector('.contact-owner-btn');
  const emailElement = document.getElementById('bookOwnerEmail');
  const bookNameElement = document.getElementById('myBookName');
  const bookTypeElement = document.getElementById('myBookType');
  const bookPriceElement = document.getElementById('myBookPrice');

  if (!contactOwnerBtn || !emailElement) return;

  contactOwnerBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const ownerEmail = emailElement.textContent;
    const bookName = bookNameElement ? bookNameElement.textContent : '';
    const bookType = bookTypeElement ? bookTypeElement.textContent : '';
    const bookPrice = bookPriceElement ? bookPriceElement.textContent : '';

    const subject = encodeURIComponent(`Interested in your book: ${bookName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI am interested in your book listed on BookSwap:\n\n` +
      `Book: ${bookName}\n` +
      `Type: ${bookType}\n` +
      `Price: ${bookPrice}\n\n` +
      `Please let me know if it is still available.\n\n` +
      `Thank you!`
    );

    window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
  });
}

function showAuthPopup() {
  const popup = document.createElement('div');
  popup.className = 'auth-popup';
  popup.innerHTML = `
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
        <h3 class="auth-popup-title">Sign In Required</h3>
        <p class="auth-popup-message">Please sign in to contact the book owner</p>
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

  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('show'), 100);

  const closeBtn = popup.querySelector('.auth-popup-close');
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 500);
  });
}