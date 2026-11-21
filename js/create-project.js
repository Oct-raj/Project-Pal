
const projectForm = document.getElementById("projectForm");

projectForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const formMessage = document.getElementById("formMessage");
    const submitButton = projectForm.querySelector("button[type='submit']");

    submitButton.disabled = true;
    formMessage.innerText = "Publishing project...";

    try {
        const { data: { user }, error: authError } =
            await window.supabaseClient.auth.getUser();

        if (authError || !user) {
            formMessage.innerText = "Please login first to publish a project.";
            return;
        }

        const project = {
            owner_id: user.id,
            title: document.getElementById("title").value.trim(),
            description: document.getElementById("description").value.trim(),
            skills: document.getElementById("skills").value.trim(),
            category: document.getElementById("category").value
        };

        const { error } = await window.supabaseClient
            .from("projects")
            .insert([project]);

        if (error) throw error;

        formMessage.innerText = "Project published successfully!";
        projectForm.reset();

    } catch (error) {
        console.error(error);
        formMessage.innerText = error.message || "Something went wrong.";
    } finally {
        submitButton.disabled = false;
    }
});
