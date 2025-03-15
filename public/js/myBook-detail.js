var bookId = window.location.pathname.split('/').pop();
var token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // Check if user is not logged in
    if (!token) {
        // Create and show login required popup
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
                    <p class="auth-popup-message">Please sign in to access this feature and explore our book collection</p>
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

        // Show popup with a slight delay for smooth animation
        setTimeout(() => popup.classList.add('show'), 100);

        // Handle close button
        const closeBtn = popup.querySelector('.auth-popup-close');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 500); // Match the transition duration
        });

        return;
    }

    const myBookName = document.getElementById('myBookName');
    const myBookCover = document.getElementById('myBookCover');
    const myBookType = document.getElementById('myBookType');
    const myBookPrice = document.getElementById('myBookPrice');
    const myBookDescription = document.getElementById('myBookDescription');
    const myBookAddedBy = document.getElementById('myBookAddedBy');
    const errorDiv = document.getElementById('myBookError');
    const bookOwnerName = document.getElementById('bookOwnerName');
    const bookOwnerEmail = document.getElementById('bookOwnerEmail');
    const bookOwnerPhone = document.getElementById('bookOwnerPhone');
    const bookOwnerAddress = document.getElementById('bookOwnerAddress');
    var adminDiv = document.getElementById("admin");
    var common = document.getElementById("common");
    var owerDetail = document.getElementById("owerDetail");
    const distanceLabel = document.getElementById('distanceLabel');
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]), // Default center
            zoom: 2
        })
    });
    adminDiv.classList.add("hidden");
    common.classList.add("hidden")
    owerDetail.classList.add("hidden")
    if (!token) {
        errorDiv.textContent = 'You must be logged in to view myBook details.';
        errorDiv.style.display = 'block';
        return;
    }

    // Get myBook ID from URL
    const myBookId = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/api/book/${myBookId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.ReturnCode === 200) {
            const myBook = data.Data;
            console.log(myBook);

            myBook.admin ? common.remove("hidden") || owerDetail.remove("hidden") : adminDiv.remove("hidden");
            myBookName.textContent = myBook.bookName;
            myBookCover.src = myBook.coverImage;
            myBookType.textContent = myBook.bookType;
            myBookPrice.textContent = `€${myBook.price.toFixed(2)}`;
            myBookDescription.textContent = myBook.description || 'No description available.';
            bookOwnerName.textContent = myBook.sellerData.name || ''
            bookOwnerEmail.textContent = myBook.sellerData.email || ''
            bookOwnerPhone.textContent = myBook.sellerData.number || ''
            bookOwnerAddress.textContent = myBook.sellerData.address || ''
            errorDiv.style.display = 'none';
            if (myBook.admin == false) {
                calculateDistanceAndShowMap(myBook.userData.postcode, myBook.sellerData.postcode, map, distanceLabel)
                onlineDetail(myBook)
            } else {
                onlineDetail(myBook)
            }
        } else {
            errorDiv.textContent = data.message || 'Failed to load Book details.';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.log(err);
        errorDiv.textContent = 'Error loading Book details.';
        errorDiv.style.display = 'block';
    }

    setupContactOwner();
});

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

async function onlineDetail(myBook) {
    console.log(myBook);

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${myBook.bookName}`, {
            method: 'GET'
        });

        const onlineBookView = await response.json();
        console.log(onlineBookView);

        if (onlineBookView.items) {
            console.log(onlineBookView.items[1].volumeInfo);

            const reviewsContainer = document.getElementById("reviewsContainer");
            reviewsContainer.innerHTML = renderJSON(onlineBookView.items[0].volumeInfo);
        } else {
            errorDiv.textContent = data.message || 'Failed to load OnlineBook details.';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.textContent = 'Error loading myBook details.';
        errorDiv.style.display = 'block';
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

// Add contact owner functionality
function setupContactOwner() {
    const contactOwnerBtn = document.querySelector('.contact-owner-btn');
    if (!contactOwnerBtn) return;

    contactOwnerBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Create and show login required popup
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
            return;
        }

        // Create and show the contact form popup
        const popup = document.createElement('div');
        popup.className = 'contact-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <button class="close-btn" aria-label="Close">&times;</button>
                <h2 style="color: var(--secondary); font-size: 1.5rem; margin-bottom: 1.5rem;">Contact Book Owner</h2>
                <form id="contactForm">
                    <div class="form-group">
                        <label for="message" style="display: block; margin-bottom: 0.5rem; color: var(--secondary);">Your Message:</label>
                        <textarea id="message" rows="4" placeholder="Hi, I am interested in your book. I would like to know more about its condition and if it's still available..." required
                            style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; resize: vertical; min-height: 120px; font-size: 1rem;"></textarea>
                    </div>
                    <button type="submit" class="submit-btn" style="width: 100%; padding: 1rem; background: var(--primary); color: var(--secondary); border: none; border-radius: 8px; font-weight: 600; margin-top: 1rem; cursor: pointer;">
                        <i class="fas fa-paper-plane"></i>
                        Send Message
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 100);

        // Handle close button
        const closeBtn = popup.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        });

        // Handle form submission
        const form = popup.querySelector('#contactForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const message = form.querySelector('#message').value;
            const bookId = window.location.pathname.split('/').pop();

            try {
                const submitBtn = form.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                const response = await fetch('/api/contact-owner', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookId,
                        message
                    })
                });

                if (response.ok) {
                    popup.innerHTML = `
                        <div class="popup-content">
                            <button class="close-btn" aria-label="Close">&times;</button>
                            <div style="text-align: center; padding: 2rem 1rem;">
                                <i class="fas fa-check-circle" style="font-size: 3rem; color: #48bb78; margin-bottom: 1rem;"></i>
                                <h2 style="color: var(--secondary); font-size: 1.5rem; margin-bottom: 1rem;">Message Sent!</h2>
                                <p style="color: var(--accent); margin-bottom: 1.5rem;">Your message has been sent to the book owner. They will contact you soon.</p>
                                <button onclick="this.closest('.contact-popup').remove()" class="submit-btn" style="width: auto; padding: 0.75rem 2rem;">
                                    <i class="fas fa-times"></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    `;

                    // Add close button functionality for success message
                    const newCloseBtn = popup.querySelector('.close-btn');
                    newCloseBtn.addEventListener('click', () => {
                        popup.classList.remove('show');
                        setTimeout(() => popup.remove(), 300);
                    });
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to send message');
                }
            } catch (error) {
                const submitBtn = form.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';

                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = 'color: #e53e3e; background: #fff5f5; border: 1px solid #feb2b2; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem;';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;

                const existingError = form.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                form.appendChild(errorDiv);
            }
        });
    });
} 