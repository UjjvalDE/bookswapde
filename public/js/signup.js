// public/js/signup.js
document.addEventListener('DOMContentLoaded', async () => {
    const countryCodeSelect = document.getElementById('country_code');
    const cityInput = document.getElementById('city');
    const streetInput = document.getElementById('street');
    const postcodeInput = document.getElementById('postcode');
    const countryInput = document.getElementById('country');
    const citySearch = document.getElementById('city_search');
    const streetSearch = document.getElementById('street_search');
    const citySuggestions = document.getElementById('city_suggestions');
    const streetSuggestions = document.getElementById('street_suggestions');
    const addressFields = document.querySelector('.address-fields');
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');
    const submitButton = document.querySelector('.btn-submit');

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
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5
            });

            if (type === 'city') {
                params.append('featuretype', 'city');
            }

            const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
            if (!response.ok) throw new Error('Failed to fetch places');
            return await response.json();
        } catch (error) {
            console.error('Error searching places:', error);
            return [];
        }
    }

    // Update suggestions list
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

    // Create book categories UI
    const interestedBooksDiv = document.getElementById('interestedBooks');
    if (interestedBooksDiv) {
        interestedBooksDiv.innerHTML = `
            <div class="book-categories-grid">
                ${bookCategories.map(category => `
                    <div class="book-category-item">
                        <input type="checkbox" 
                               id="category-${category.value}" 
                               name="interestedBooks" 
                               value="${category.value}"
                               class="category-checkbox">
                        <label for="category-${category.value}" class="category-label" style="--category-color: ${category.color}">
                            <i class="fas ${category.icon}"></i>
                            <span>${category.value}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;

        // Add styles for book categories
        const style = document.createElement('style');
        style.textContent = `
            .book-categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .book-category-item {
                position: relative;
            }

            .category-checkbox {
                position: absolute;
                opacity: 0;
                cursor: pointer;
            }

            .category-label {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 1px solid #e0e0e0;
                font-size: 1rem;
                height: 100%;
                min-height: 60px;
            }

            .category-label i {
                color: var(--category-color);
                font-size: 1.25rem;
                transition: all 0.3s ease;
                min-width: 24px;
                text-align: center;
            }

            .category-label span {
                color: #2c3e50;
                font-weight: 500;
                flex: 1;
            }

            .category-checkbox:checked + .category-label {
                background: var(--category-color);
                border-color: var(--category-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .category-checkbox:checked + .category-label i,
            .category-checkbox:checked + .category-label span {
                color: white;
            }

            .category-checkbox:checked + .category-label i {
                transform: scale(1.2);
            }

            .category-label:hover {
                border-color: var(--category-color);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }

            @media (max-width: 1200px) {
                .book-categories-grid {
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                }
            }

            @media (max-width: 768px) {
                .book-categories-grid {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 0.75rem;
                }

                .category-label {
                    padding: 0.75rem;
                    min-height: 50px;
                    font-size: 0.9rem;
                }

                .category-label i {
                    font-size: 1.1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Form submission handler with loading state
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        submitButton.disabled = true;
        const buttonLoader = document.querySelector('.button-loader');
        if (buttonLoader) buttonLoader.style.display = 'block';

        // Validate required fields
        const requiredFields = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            country_code: countryCodeSelect.value,
            number: document.getElementById('number').value,
            address: streetInput.value ? `${streetInput.value}, ${cityInput.value}, ${countryInput.value}` : '',
            postcode: postcodeInput.value,
            interestedBooks: Array.from(document.querySelectorAll('input[name="interestedBooks"]:checked'))
                .map(cb => cb.value)
        };

        // Check for missing fields
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || (Array.isArray(value) && value.length === 0))
            .map(([key]) => key);

        if (missingFields.length > 0) {
            showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            submitButton.disabled = false;
            if (buttonLoader) buttonLoader.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requiredFields)
            });

            const data = await response.json();

            if (data.ReturnCode === 200) {
                const emailCallModal = new bootstrap.Modal(document.getElementById('emailCall'));
                emailCallModal.show();

                // Add event listener for modal close and redirect
                document.getElementById('emailCall').addEventListener('hidden.bs.modal', function () {
                    window.location.href = '/login';
                });

                // Automatically redirect after 3 seconds
                setTimeout(() => {
                    emailCallModal.hide();
                    window.location.href = '/login';
                }, 3000);
            } else {
                showError(data.ReturnMsg || 'Error creating account. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('Error creating account. Please try again.');
        } finally {
            submitButton.disabled = false;
            if (buttonLoader) buttonLoader.style.display = 'none';
        }
    });

    function showError(message) {
        signupError.textContent = message;
        signupError.style.display = 'block';
        setTimeout(() => {
            signupError.style.display = 'none';
        }, 3000);
    }

    // Initialize country codes
    async function fetchCountryCodes() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            if (!response.ok) throw new Error('Failed to fetch countries');

            const countries = await response.json();
            countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

            countryCodeSelect.innerHTML = '<option value="">Select Code</option>';

            countries.forEach(country => {
                if (country.idd?.root) {
                    const code = country.idd.root + (country.idd.suffixes?.[0] || '');
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = `${code} (${country.name.common})`;
                    countryCodeSelect.appendChild(option);
                }
            });

            // Set Ireland as default
            const germanyOption = Array.from(countryCodeSelect.options)
                .find(option => option.textContent.includes('Germany'));
            if (germanyOption) {
                germanyOption.selected = true;
            }

        } catch (error) {
            console.error('Error fetching countries:', error);
            showError('Error loading country data. Please try again later.');
        }
    }

    // Initialize
    fetchCountryCodes();
});