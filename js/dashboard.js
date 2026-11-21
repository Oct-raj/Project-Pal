
const client = window.supabaseClient;

const myProjects = document.getElementById("myProjects");
const joinRequests = document.getElementById("joinRequests");
const joinedProjects = document.getElementById("joinedProjects");
const connectionRequests = document.getElementById("connectionRequests");
const myConnections = document.getElementById("myConnections");

async function loadDashboard() {
    try {
        const { data: { user }, error: authError } =
            await client.auth.getUser();

        if (authError) throw authError;

        if (!user) {
            myProjects.innerText = "Please login first.";
            joinRequests.innerHTML = "";
            joinedProjects.innerHTML = "";
            connectionRequests.innerHTML = "";
            myConnections.innerHTML = "";

            document.getElementById("userName").innerText = "Guest";
            document.getElementById("userEmail").innerText = "";

            return;
        }

        // USER DETAILS
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

        // MY PROJECTS
        const { data: projects, error } = await client
            .from("projects")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        document.getElementById("totalProjects").innerText =
            projects.length;

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

        // PROJECT JOIN REQUESTS
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
                const { data: requester, error: requesterError } =
                    await client
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
                name.innerText = requester?.full_name || "Student";

                const email = document.createElement("p");
                email.innerText = requester?.email || "";

                const projectName = document.createElement("p");
                projectName.innerText =
                    "Project: " + (project?.title || "Unknown Project");

                const message = document.createElement("p");
                message.innerText =
                    request.message || "Wants to join your project.";

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

                card.append(
                    name,
                    email,
                    projectName,
                    message,
                    accept,
                    reject
                );

                joinRequests.appendChild(card);
            }

        } else {
            joinRequests.innerText =
                "Create a project to receive requests.";
        }

        // JOINED PROJECTS
        const { data: memberships, error: memberError } = await client
            .from("project_members")
            .select("project_id")
            .eq("member_id", user.id);

        if (memberError) throw memberError;

        joinedProjects.innerHTML = "";

        if (memberships.length > 0) {
            const ids = [...new Set(memberships.map(m => m.project_id))];

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
            joinedProjects.innerText =
                "You haven't joined any projects yet.";
        }

        // INCOMING CONNECTION REQUESTS
        connectionRequests.innerHTML = "";

        const { data: incoming, error: incomingError } = await client
            .from("connection_requests")
            .select("*")
            .eq("receiver_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (incomingError) throw incomingError;

        // Avoid showing duplicate pending requests from same student
        const uniqueIncoming = new Map();

        incoming.forEach(request => {
            if (!uniqueIncoming.has(request.sender_id)) {
                uniqueIncoming.set(request.sender_id, request);
            }
        });

        if (uniqueIncoming.size === 0) {
            connectionRequests.innerText =
                "No new connection requests.";
        }

        for (const request of uniqueIncoming.values()) {
            const { data: sender, error: senderError } = await client
                .from("profiles")
                .select("full_name, email")
                .eq("id", request.sender_id)
                .maybeSingle();

            if (senderError) throw senderError;

            const card = document.createElement("div");
            card.className = "project-card";

            const name = document.createElement("h3");
            name.innerText = sender?.full_name || "Student";

            const email = document.createElement("p");
            email.innerText = sender?.email || "";

            const accept = document.createElement("button");
            accept.className = "primary-btn";
            accept.innerText = "Accept";

            const reject = document.createElement("button");
            reject.className = "primary-btn";
            reject.innerText = "Reject";
            reject.style.marginLeft = "10px";

            accept.addEventListener("click", () =>
                manageConnection(request.id, "accepted")
            );

            reject.addEventListener("click", () =>
                manageConnection(request.id, "rejected")
            );

            card.append(name, email, accept, reject);
            connectionRequests.appendChild(card);
        }

        // MY CONNECTIONS
        myConnections.innerHTML = "";

        const { data: connections, error: connectionsError } = await client
            .from("connection_requests")
            .select("*")
            .eq("status", "accepted")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (connectionsError) throw connectionsError;

        // REMOVE DUPLICATE CONNECTIONS
        const uniqueConnections = new Map();

        connections.forEach(connection => {
            const otherUserId =
                connection.sender_id === user.id
                    ? connection.receiver_id
                    : connection.sender_id;

            if (otherUserId && otherUserId !== user.id) {
                uniqueConnections.set(otherUserId, connection);
            }
        });

        if (uniqueConnections.size === 0) {
            myConnections.innerText = "No connections yet.";
        }

        for (const [otherUserId] of uniqueConnections) {
            const { data: student, error: studentError } = await client
                .from("profiles")
                .select("full_name, email")
                .eq("id", otherUserId)
                .maybeSingle();

            if (studentError) throw studentError;

            const card = document.createElement("div");
            card.className = "project-card";

            const name = document.createElement("h3");
            name.innerText = student?.full_name || "Student";

            const email = document.createElement("p");
            email.innerText = student?.email || "";

            const status = document.createElement("p");
            status.innerText = "Connected ✓";

            // MESSAGE BUTTON
            const chatButton = document.createElement("button");
            chatButton.className = "primary-btn";
            chatButton.innerText = "Message";

            chatButton.addEventListener("click", function() {
                window.location.href =
                    "chat.html?user=" + encodeURIComponent(otherUserId);
            });

            card.append(name, email, status, chatButton);
            myConnections.appendChild(card);
        }

        // DASHBOARD STATISTICS
        document.getElementById("activeProjects").innerText =
            projects.length + memberships.length;

    } catch (error) {
        console.error("Dashboard Error:", error);
        myProjects.innerText = "Error: " + error.message;
    }
}


// HANDLE PROJECT JOIN REQUESTS
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


// HANDLE TEAMMATE CONNECTION REQUESTS
async function manageConnection(requestId, status) {
    try {
        const { error } = await client
            .from("connection_requests")
            .update({ status: status })
            .eq("id", requestId);

        if (error) throw error;

        alert(
            status === "accepted"
                ? "Connection accepted!"
                : "Connection rejected!"
        );

        await loadDashboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// LOAD DASHBOARD
loadDashboard();
