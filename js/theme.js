
const savedTheme = localStorage.getItem("projectPalTheme") || "dark";

document.documentElement.setAttribute("data-theme", savedTheme);

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.textContent = savedTheme === "dark" ? "☀ Light" : "🌙 Dark";

    themeToggle.addEventListener("click", function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("projectPalTheme", newTheme);

        themeToggle.textContent = newTheme === "dark" ? "☀ Light" : "🌙 Dark";
    });
}
