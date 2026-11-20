
const searchInput = document.getElementById("searchInput");
const projectGrid = document.getElementById("projectGrid");
const noResults = document.getElementById("noResults");

function displayProjects() {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];

    savedProjects.forEach(function(project) {
        const card = document.createElement("div");
        card.className = "project-card";

        const tag = document.createElement("span");
        tag.className = "project-tag";
        tag.innerText = project.category;

        const title = document.createElement("h2");
        title.innerText = project.title;

        const description = document.createElement("p");
        description.innerText = project.description;

        const skills = document.createElement("p");
        skills.innerText = "Skills: " + project.skills;

        card.append(tag, title, description, skills);
        projectGrid.appendChild(card);
    });
}

displayProjects();

searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".project-card");
    let count = 0;

    cards.forEach(function(card) {
        if (card.innerText.toLowerCase().includes(searchText)) {
            card.style.display = "block";
            count++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.style.display = count === 0 ? "block" : "none";
});
