
function showMessage(message) {
    const msg = document.createElement("div");
    msg.innerText = message;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6c63ff;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
    `;

    document.body.appendChild(msg);

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

async function signup() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        alert(error.message);
    } else {
        showMessage("Account created successfully!");
    }
}

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all fields!");
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
    } else {
        showMessage("Login successful!");
    }
}
