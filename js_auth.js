// js/auth.js

const loginEmailInput = document.getElementById('login-email');
const loginButton = document.getElementById('login-button');
const termsCheckbox = document.getElementById('terms-conditions');
const loginMessage = document.getElementById('login-message');
const logoutButton = document.getElementById('logout-button');

// FIX: Connection Checker Function
function checkSupabaseConnection() {
    // If supabase exists but .auth is missing, it means the variable conflict happened
    // and we are looking at the Library object, not the Client object.
    if (!window.supabase || !window.supabase.auth) {
        const errorMsg = "CRITICAL ERROR: Supabase Client not initialized. Variable conflict detected.";
        console.error(errorMsg);
        if (loginMessage) loginMessage.textContent = errorMsg;
        alert("App Error: Database connection failed. Please refresh the page.");
        return false;
    }
    return true;
}

async function handleLogin() {
    // Run the safety check before doing anything
    if (!checkSupabaseConnection()) return;

    const email = loginEmailInput.value.trim();

    if (!email) {
        loginMessage.textContent = 'Please enter your email.';
        return;
    }
    if (!termsCheckbox.checked) {
        loginMessage.textContent = 'You must accept the Terms & Conditions.';
        return;
    }

    loginMessage.textContent = 'Logging in...';
    loginButton.disabled = true;

    try {
        // For passwordless login (magic link)
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: 'https://jeyaram1023.github.io/StreetR-seller-app',  // 💡 Full path needed here
            },
        });
        
        if (error) {
            throw error;
        }

        loginMessage.textContent = 'Login link sent! Check your email to sign in.';
        // Optionally clear the form or provide further instructions
        // loginEmailInput.value = '';
        // termsCheckbox.checked = false;

        // Note: User will click the link in their email.
        // The app needs to handle the session when they return.
        // See main.js for session handling on load.

    } catch (error) {
        console.error('Login error:', error);
        loginMessage.textContent = `Error: ${error.message}`;
    } finally {
        loginButton.disabled = false;
    }
}

async function handleLogout() {
    if (!checkSupabaseConnection()) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    } else {
        localStorage.clear(); // Clear all local storage on logout
        window.currentUser = null;
        navigateToPage('login-page');
        document.getElementById('app-header').style.display = 'none';
        document.getElementById('bottom-nav').style.display = 'none';
        logoutButton.style.display = 'none';
    }
}

async function getCurrentUser() {
    // Safe check that returns null instead of crashing if supabase is broken
    if (!window.supabase || !window.supabase.auth) {
        console.warn("Supabase not ready when checking current user.");
        return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error.message);
        return null;
    }
    if (session && session.user) {
        return session.user;
    }
    return null;
}

// Event Listeners
if (loginButton) {
    loginButton.addEventListener('click', handleLogin);
}
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}
