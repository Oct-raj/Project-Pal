
const projectForm = document.getElementById("projectForm");

projectForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const project = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        skills: document.getElementById("skills").value,
        category: document.getElementById("category").value
    };

    let projects = JSON.parse(localStorage.getItem("projects")) || [];

    projects.push(project);

    localStorage.setItem("projects", JSON.stringify(projects));

    document.getElementById("formMessage").innerText =
        "Your project has been published successfully!";

    projectForm.reset();
});
