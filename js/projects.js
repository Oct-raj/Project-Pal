
const searchInput = document.getElementById("searchInput");
const projectGrid = document.getElementById("projectGrid");
const noResults = document.getElementById("noResults");

let allProjects = [];

async function displayProjects() {
    projectGrid.innerHTML = "<p>Loading projects...</p>";

    try {
        const { data, error } = await window.supabaseClient
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        allProjects = data;
        showProjects(allProjects);

    } catch (error) {
        console.error(error);
        projectGrid.innerHTML = "<p>Unable to load projects. Please try again.</p>";
    }
}

function showProjects(projects) {
    projectGrid.innerHTML = "";

    noResults.style.display = projects.length === 0 ? "block" : "none";

    projects.forEach(function(project) {
        const card = document.createElement("div");
        card.className = "project-card";

        const tag = document.createElement("span");
        tag.className = "project-tag";
        tag.innerText = project.category || "Other";

        const title = document.createElement("h2");
        title.innerText = project.title;

        const description = document.createElement("p");
        description.innerText = project.description;

        const skills = document.createElement("p");
        skills.innerText = "Skills: " + project.skills;

        const joinButton = document.createElement("button");
        joinButton.className = "primary-btn";
        joinButton.innerText = "Join Project";

        joinButton.addEventListener("click", function() {
            sendJoinRequest(project.id, joinButton);
        });

        card.append(tag, title, description, skills, joinButton);
        projectGrid.appendChild(card);
    });
}

searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();

    const filteredProjects = allProjects.filter(function(project) {
        return (
            project.title.toLowerCase().includes(searchText) ||
            project.description.toLowerCase().includes(searchText) ||
            (project.skills || "").toLowerCase().includes(searchText) ||
            (project.category || "").toLowerCase().includes(searchText)
        );
    });

    showProjects(filteredProjects);
});

async function sendJoinRequest(projectId, button) {
    button.disabled = true;
    button.innerText = "Sending...";

    try {
        const { data: { user }, error: authError } =
            await window.supabaseClient.auth.getUser();

        if (authError || !user) {
            alert("Please login first to join a project.");
            return;
        }

        const { error } = await window.supabaseClient
            .from("project_join_requests")
            .insert([{
                project_id: projectId,
                requester_id: user.id,
                message: "I want to join this project."
            }]);

        if (error) throw error;

        alert("Join request sent successfully!");
        button.innerText = "Request Sent";

    } catch (error) {
        console.error(error);
        alert(error.code === "23505"
            ? "You have already requested to join this project."
            : error.message);
        button.innerText = "Join Project";

    } finally {
        button.disabled = false;
    }
}

displayProjects();
