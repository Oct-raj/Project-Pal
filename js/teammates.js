
const studentSearch = document.getElementById("studentSearch");
const teamGrid = document.getElementById("teamGrid");
const noStudents = document.getElementById("noStudents");

let allStudents = [];

async function loadStudents() {
    teamGrid.innerHTML = "<p>Loading students...</p>";

    try {
        const { data: { user } } =
            await window.supabaseClient.auth.getUser();

        if (!user) {
            teamGrid.innerHTML = "<p>Please login to view students.</p>";
            return;
        }

        const { data: students, error } = await window.supabaseClient
            .from("profiles")
            .select("id, full_name, email")
            .neq("id", user.id)
            .order("full_name");

        if (error) throw error;

        allStudents = students;
        showStudents(allStudents);

    } catch (error) {
        console.error(error);
        teamGrid.innerHTML = "<p>Unable to load students: " + error.message + "</p>";
    }
}

function showStudents(students) {
    teamGrid.innerHTML = "";
    noStudents.style.display = students.length === 0 ? "block" : "none";

    students.forEach(function(student) {
        const card = document.createElement("div");
        card.className = "team-card";

        const avatar = document.createElement("div");
        avatar.className = "student-avatar";
        avatar.innerText = "👨‍🎓";

        const name = document.createElement("h2");
        name.innerText = student.full_name || "Student";

        const email = document.createElement("p");
        email.className = "student-role";
        email.innerText = student.email || "";

        const button = document.createElement("button");
        button.className = "primary-btn";
        button.innerText = "Connect";

        button.addEventListener("click", function() {
            sendRequest(student.id, button);
        });

        card.append(avatar, name, email, button);
        teamGrid.appendChild(card);
    });
}

studentSearch.addEventListener("input", function() {
    const search = studentSearch.value.toLowerCase();

    const filtered = allStudents.filter(function(student) {
        return (
            (student.full_name || "").toLowerCase().includes(search) ||
            (student.email || "").toLowerCase().includes(search)
        );
    });

    showStudents(filtered);
});

async function sendRequest(receiverId, button) {
    button.disabled = true;
    button.innerText = "Sending...";

    try {
        const { data: { user } } =
            await window.supabaseClient.auth.getUser();

        if (!user) {
            alert("Please login first!");
            button.innerText = "Connect";
            return;
        }

        const { error } = await window.supabaseClient
            .from("connection_requests")
            .insert([{
                sender_id: user.id,
                receiver_id: receiverId
            }]);

        if (error) {
            if (error.code === "23505") {
                alert("You have already sent a request!");
            } else {
                throw error;
            }
            button.innerText = "Connect";
        } else {
            button.innerText = "Request Sent";
        }

    } catch (error) {
        console.error(error);
        alert(error.message);
        button.innerText = "Connect";
    }

    button.disabled = false;
}

loadStudents();
