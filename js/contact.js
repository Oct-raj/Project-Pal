
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const button = document.getElementById("sendMessage");
    const status = document.getElementById("contactStatus");

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (message.length < 10) {
        status.innerText = "Message must contain at least 10 characters.";
        return;
    }

    button.disabled = true;
    button.innerText = "Sending...";

    try {
        const { error } = await window.supabaseClient
            .from("contact_messages")
            .insert([{
                full_name: fullName,
                email: email,
                subject: subject,
                message: message
            }]);

        if (error) throw error;

        status.innerText = "Message sent successfully! Thank you for contacting us.";
        contactForm.reset();

    } catch (error) {
        status.innerText = "Error: " + error.message;
    }

    button.disabled = false;
    button.innerText = "Send Message →";
});
