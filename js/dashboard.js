
const client = window.supabaseClient;

const myProjects = document.getElementById("myProjects");
const joinRequests = document.getElementById("joinRequests");
const joinedProjects = document.getElementById("joinedProjects");

async function loadDashboard() {
    try {
        const { data: { user }, error: authError } =
            await client.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            myProjects.innerText = "Please login first.";
            joinRequests.innerHTML = "";
            joinedProjects.innerHTML = "";
            document.getElementById("userName").innerText = "Guest";
            document.getElementById("userEmail").innerText = "";
            return;
        }

        // User Details
        const { data: profile, error: profileError } = await client
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        document.getElementById("userName").innerText =
            profile?.full_name || user.user_metadata?.full_name || "Student";

        document.getElementById("userEmail").innerText =
            profile?.email || user.email;

        // My Projects
        const { data: projects, error } = await client
            .from("projects")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        document.getElementById("totalProjects").innerText = projects.length;
        myProjects.innerHTML = "";

        if (projects.length === 0) {
            myProjects.innerText = "No projects created yet.";
        }

        projects.forEach(function(project) {
            const card = document.createElement("div");
            card.className = "project-card";

            const title = document.createElement("h3");
            title.innerText = project.title;

            const description = document.createElement("p");
            description.innerText = project.description;

            const skills = document.createElement("p");
            skills.innerText = "Skills: " + project.skills;

            card.append(title, description, skills);
            myProjects.appendChild(card);
        });

        // Join Requests
        joinRequests.innerHTML = "";

        if (projects.length > 0) {
            const projectIds = projects.map(p => p.id);

            const { data: requests, error: requestError } = await client
                .from("project_join_requests")
                .select("*")
                .in("project_id", projectIds)
                .eq("status", "pending");

            if (requestError) throw requestError;

            if (requests.length === 0) {
                joinRequests.innerText = "No pending join requests.";
            }

            for (const request of requests) {
                const { data: profile, error: requesterError } = await client
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", request.requester_id)
                    .maybeSingle();

                if (requesterError) throw requesterError;

                const project = projects.find(
                    p => p.id === request.project_id
                );

                const card = document.createElement("div");
                card.className = "project-card";

                const name = document.createElement("h3");
                name.innerText =
                    profile?.full_name || profile?.email || "Student";

                const email = document.createElement("p");
                email.innerText = profile?.email || "";

                const projectName = document.createElement("p");
                projectName.innerText = "Project: " + project.title;

                const message = document.createElement("p");
                message.innerText = request.message || "Wants to join your project.";

                const accept = document.createElement("button");
                accept.className = "primary-btn";
                accept.innerText = "Accept";

                const reject = document.createElement("button");
                reject.className = "primary-btn";
                reject.innerText = "Reject";
                reject.style.marginLeft = "10px";

                accept.addEventListener("click", () =>
                    manageRequest(request.id, true)
                );

                reject.addEventListener("click", () =>
                    manageRequest(request.id, false)
                );

                card.append(name, email, projectName, message, accept, reject);
                joinRequests.appendChild(card);
            }
        } else {
            joinRequests.innerText = "Create a project to receive requests.";
        }

        // Joined Projects
        const { data: memberships, error: memberError } = await client
            .from("project_members")
            .select("project_id")
            .eq("member_id", user.id);

        if (memberError) throw memberError;

        joinedProjects.innerHTML = "";

        if (memberships.length > 0) {
            const ids = memberships.map(m => m.project_id);

            const { data: joined, error: joinedError } = await client
                .from("projects")
                .select("*")
                .in("id", ids);

            if (joinedError) throw joinedError;

            joined.forEach(function(project) {
                const card = document.createElement("div");
                card.className = "project-card";

                const title = document.createElement("h3");
                title.innerText = project.title;

                const description = document.createElement("p");
                description.innerText = project.description;

                card.append(title, description);
                joinedProjects.appendChild(card);
            });
        } else {
            joinedProjects.innerText = "You haven't joined any projects yet.";
        }

        document.getElementById("activeProjects").innerText =
            projects.length + memberships.length;

    } catch (error) {
        console.error("Dashboard Error:", error);
        myProjects.innerText = "Error: " + error.message;
    }
}

async function manageRequest(requestId, accepted) {
    try {
        const { error } = await client.rpc("handle_join_request", {
            p_request_id: requestId,
            p_accepted: accepted
        });

        if (error) throw error;

        alert(accepted ? "Request accepted!" : "Request rejected!");
        await loadDashboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

loadDashboard();
