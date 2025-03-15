
// Function to check if the user is already logged in
function checkLoginStatus() {
    const user = localStorage.getItem("token"); // Get user from local storage
    if (user) {
        // Redirect to the dashboard if the user is already logged in
        window.location.href = "/";
    }
}

// Run this function when the page loads
window.onload = checkLoginStatus;