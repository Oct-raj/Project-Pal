
const searchInput = document.getElementById("searchInput");
const projectCards = document.querySelectorAll(".project-card");
const noResults = document.getElementById("noResults");

searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.toLowerCase();
    let visibleCount = 0;

    projectCards.forEach(function (card) {
        const projectText = card.innerText.toLowerCase();

        if (projectText.includes(searchText)) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.style.display = visibleCount === 0 ? "block" : "none";
});
