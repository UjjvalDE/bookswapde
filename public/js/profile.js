// public/js/profile.js
document.addEventListener('DOMContentLoaded', async () => {
    const profileImage = document.getElementById('profileImage');
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const userAddress = document.getElementById('userAddress');
    const userEmail = document.getElementById('userEmail');
    const interestedBooksDiv = document.getElementById('interestedBooks');
    const errorDiv = document.getElementById('profileError');
    const token = localStorage.getItem('token');

    const cartoonUrls = {
        cat: 'https://media-hosting.imagekit.io//0f593923344a43d6/cat.jpeg?Expires=1835982747&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Av9Zf65AAAmAWwhKtkfpGcdsJtCwx4~rOLehcJlA9jxxiFPHaVQDNlydD7q9wrTPzHKR4GH69uaGDWw2HbpPIbuIsLTW9252rdf7oRDkE-vxclhCDT~cwy1KIdK7O2uthxb77xToUPOCHLD-pgyCmfFo~sZhjpyFno~17GV7-xYr1a~iQSkgi-SUldLOgj9DIbANwtgRnqF9ve7YyfeqOPpsyH89sFgqcAb7vbaEmvQi6a8oX9En9Fx0macHeaiuat8BJrtLfziu8Gu2gbHDU2~uaCTbyynCKrngudIlnp9AYvILbzYfPsSIjQj5pwvBa347Uf9-~JV~c3U~B75rYg__',
        dog: 'https://media-hosting.imagekit.io//d97b52f5826f4306/dog.png?Expires=1835982684&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=D~zVxjin86ZwZ8rbcEDu4G-KlzIIuyPLXuvZk94RYun4mr5qwADw8sUAoxJQ3z9QvGStFAjv32vXWE4D0GkGhAqan7ngWM93UPszoPLrAvjOBiXJfRvi661njJPZD7VzckNmL15oVhDiiyzrfZocLSzCMLG6SX48f~KmI5B0sGz2Zg9w7BTDLhIBEhLjNBpJkN2QfFAov-FLWdXCeqhMHTIxHSxaTdFqnOjTn6wv8kDYR1kxfgiWsmEw2SBnaDoxwWJAgx2T0gN8OtbwxV1sl0a6lrAP8NxrN5T3nrXIayAzAWVaoy4IX9oXJCwgSwxCJUbChBJzNWAJU56OAtXOOQ__',
        pug: 'https://media-hosting.imagekit.io//f896d1c965bf4921/smalldog.png?Expires=1835984672&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R6Pia6cNw7r8w0Nc-UeNqcB86h6p6p9DIk8SSIro0JPrDNPq-Osku1NqqBKDnZblMlJIkMBfevEVzY5DqHq9He37nCoNeWhn3WlEAARk6oW8EjqfOj~hEsyXurkPv0yCWAZXSJ~FXWLr4CAL3m5QucvFnQQx5YBZzOyNYtwcnttqwtQ6Q3qMlYvF~ZJOSltgVCvDtY9LN7BZ1ctL1A3Ih4tWDCZKHek-eddbQkyVcC6j8bNTRMiG0w5iSvjzcwT8IZlMAST80jlco1NisVCDZGAYtXs1WvOySnVh8254EkEHg~vvEPi4nQ4LIv~rZN3AvZqsAEUuru53nnt88yTXrg__',
        lion: 'https://media-hosting.imagekit.io//fde20e130ab54445/lion.png?Expires=1835984663&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=UekN6iTrTxvZyvnaf~OBUA-A6B0dLWz767Q89JixUanD2TAyQXfmCk2GQoeU7j78VltaohGz9YC6gfco53P2k6ch0cYowPIG3F8vtpkKzBZir5nyDI7w30FyanSlTbPpmKa1GKSiCrwh-gvMqAFvDCWiXnEQ93UOShzJOlFmhKROhhuoTItSLvitzZMbwm1F2NP7yjHcNjOHW5XT4cXD0tb2zDvobRNGP15lzM6zcAG4R-zldxTrqFd25lzSsOVUe~mCXLp4-Gy8GdYOlMFFzxp3JN0WQ3IsWkM9ETAPMDwzG3o9kXv7G0i0cyXhC9lU1lf9kOZe3xnQHHT07pfwSQ__'
    };

    // Add error handler for profile image
    if (profileImage) {
        profileImage.onerror = () => {
            console.log('Profile image failed to load, using default cat image');
            profileImage.src = cartoonUrls.cat;
        };
    }

    // Check for token
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.ReturnCode === 200 && data.Data) {
            const user = data.Data;

            // Update profile image
            if (profileImage) {
                profileImage.src = cartoonUrls[user.profile_img] || cartoonUrls.cat;
            }

            // Update user details
            if (userName) userName.textContent = user.name || 'Not specified';
            if (userPhone) userPhone.textContent = user.number || 'Not specified';
            if (userAddress) userAddress.textContent = user.address || 'Not specified';
            if (userEmail) userEmail.textContent = user.email || 'Not specified';

            // Update interested books
            if (interestedBooksDiv) {
                // Create the book categories UI with user's selected categories
                createBookCategoriesUI('interestedBooks', user.interestedBooks || []);

                // Make the checkboxes read-only since this is the profile view
                const checkboxes = interestedBooksDiv.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = true;
                });

                // Add a subtle style for read-only view
                const style = document.createElement('style');
                style.textContent = `
                    .profile-view .category-label {
                        opacity: 0.8;
                        cursor: default;
                    }
                    .profile-view .category-label:hover {
                        transform: none;
                        box-shadow: none;
                    }
                `;
                document.head.appendChild(style);
                interestedBooksDiv.classList.add('profile-view');
            }

            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = data.ReturnMsg || 'Failed to load profile data';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        errorDiv.textContent = 'Error loading profile data';
        errorDiv.style.display = 'block';
    }
});