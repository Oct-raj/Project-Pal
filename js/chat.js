
const client = window.supabaseClient;

const connectionList = document.getElementById("connectionList");
const messagesBox = document.getElementById("messages");
const chatName = document.getElementById("chatName");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = chatForm.querySelector("button");

let currentUser = null;
let selectedUser = null;
let chatChannel = null;

async function loadConnections() {
    try {
        const { data: { user }, error } = await client.auth.getUser();

        if (error) throw error;

        if (!user) {
            connectionList.innerText = "Please login first.";
            return;
        }

        currentUser = user;

        const { data: connections, error: connectionError } = await client
            .from("connection_requests")
            .select("sender_id, receiver_id")
            .eq("status", "accepted")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (connectionError) throw connectionError;

        connectionList.innerHTML = "";

        if (!connections || connections.length === 0) {
            connectionList.innerText = "No connections yet.";
            return;
        }

        // Remove duplicate student IDs
        const uniqueIds = [...new Set(
            connections.map(connection =>
                connection.sender_id === user.id
                    ? connection.receiver_id
                    : connection.sender_id
            )
        )];

        const students = [];

        for (const otherId of uniqueIds) {
            const { data: student, error: profileError } = await client
                .from("profiles")
                .select("id, full_name")
                .eq("id", otherId)
                .maybeSingle();

            if (profileError) throw profileError;
            if (!student) continue;

            students.push(student);

            const person = document.createElement("div");
            person.className = "chat-person";
            person.innerText = student.full_name || "Student";

            person.addEventListener("click", () => openChat(student));

            connectionList.appendChild(person);
        }

        // Open selected chat from Dashboard
        const params = new URLSearchParams(window.location.search);
        const targetUserId = params.get("user");

        if (targetUserId) {
            const targetStudent = students.find(
                student => student.id === targetUserId
            );

            if (targetStudent) {
                await openChat(targetStudent);
            } else {
                messagesBox.innerText =
                    "This student is not in your accepted connections.";
            }
        }

    } catch (error) {
        console.error(error);
        connectionList.innerText = error.message;
    }
}

async function openChat(student) {
    selectedUser = student;

    document.querySelectorAll(".chat-person").forEach(person => {
        person.classList.remove("active");
    });

    document.querySelectorAll(".chat-person").forEach(person => {
        if (person.dataset.userId === student.id) {
            person.classList.add("active");
        }
    });

    chatName.innerText = "Chat with " + (student.full_name || "Student");
    messageInput.disabled = false;
    sendButton.disabled = false;

    if (chatChannel) {
        await client.removeChannel(chatChannel);
        chatChannel = null;
    }

    await loadMessages();
    subscribeToMessages();
}

async function loadMessages() {
    messagesBox.innerHTML = "<p>Loading messages...</p>";

    const { data, error } = await client
        .from("messages")
        .select("*")
        .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

    if (error) {
        messagesBox.innerText = error.message;
        return;
    }

    messagesBox.innerHTML = "";

    if (!data || data.length === 0) {
        messagesBox.innerHTML = "<p>No messages yet. Say hello!</p>";
        return;
    }

    data.forEach(displayMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function displayMessage(message) {
    const bubble = document.createElement("div");
    bubble.className = "message";

    if (message.sender_id === currentUser.id) {
        bubble.classList.add("mine");
    }

    bubble.innerText = message.content;
    messagesBox.appendChild(bubble);

    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function subscribeToMessages() {
    chatChannel = client
        .channel("chat-" + currentUser.id + "-" + selectedUser.id)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages"
            },
            payload => {
                const message = payload.new;

                const belongsToChat =
                    (message.sender_id === currentUser.id &&
                     message.receiver_id === selectedUser.id) ||
                    (message.sender_id === selectedUser.id &&
                     message.receiver_id === currentUser.id);

                if (belongsToChat) {
                    displayMessage(message);
                }
            }
        )
        .subscribe();
}

chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const content = messageInput.value.trim();

    if (!content || !selectedUser) return;

    sendButton.disabled = true;

    const { error } = await client
        .from("messages")
        .insert([{
            sender_id: currentUser.id,
            receiver_id: selectedUser.id,
            content: content
        }]);

    sendButton.disabled = false;

    if (error) {
        alert(error.message);
        return;
    }

    messageInput.value = "";
    messageInput.focus();
});

loadConnections();
