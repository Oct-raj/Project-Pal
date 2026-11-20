
const studentSearch = document.getElementById("studentSearch");
const teamCards = document.querySelectorAll(".team-card");
const noStudents = document.getElementById("noStudents");

studentSearch.addEventListener("input", function () {
    const searchText = studentSearch.value.toLowerCase();
    let count = 0;

    teamCards.forEach(function (card) {
        const studentInfo = card.innerText.toLowerCase();

        if (studentInfo.includes(searchText)) {
            card.style.display = "block";
            count++;
        } else {
            card.style.display = "none";
        }
    });

    noStudents.style.display = count === 0 ? "block" : "none";
});
function connectStudent(name) {
    alert("Connection request sent to " + name + "!");
}
