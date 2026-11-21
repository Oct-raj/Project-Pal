
async function signup() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    const { error } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Account created! Please check your email if confirmation is required.");
        window.location.href = "login.html";
    }
}

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all fields!");
        return;
    }

    const { error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Login successful!");
        window.location.href = "index.html";
    }
}

async function logout() {
    const { error } = await window.supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
    } else {
        window.location.href = "index.html";
    }
}

// Update navbar buttons
async function updateAuthButtons() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    const authButtons = document.getElementById("authButtons");

    if (!authButtons) return;

    if (user) {
        authButtons.innerHTML = `
            <button class="nav-btn" onclick="logout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="nav-btn">Login</a>
            <a href="signup.html" class="nav-btn">Sign Up</a>
        `;
    }
}

document.addEventListener("DOMContentLoaded", updateAuthButtons);
