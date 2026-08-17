// @ts-nocheck
console.log("SCRIPT.JS IS RUNNING");
"use strict";

const SUPABASE_URL = "https://nldvjwtfpcsfftddupwk.supabase.co"
const SUPABASE_KEY = "sb_publishable_KXpzc2iNjLjAU83LM2XlNQ_PZarkf1L"

const supabaseClient = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

async function testSupabase() {
  const {data, error} = await
  supabaseClient
  .from("chat_messages")
  .select("*")
  .limit(1);
  if (error) {
    console.error("Supabase ERROR:",error);
  } else {
    console.log("Supabase connected successfully:",data);
  }
}
testSupabase();

let localStream = null;
let isMuted = false;
let isCameraOff = false;

// ==========================
// ELEMENTS
// ==========================

const startBtn = document.getElementById("startBtn");
const hero = document.querySelector(".hero");
const chatContainer = document.getElementById("chatContainer");

const localVideo = document.getElementById("localVideo");
const localPlaceholder = document.getElementById("localPlaceholder");

const matchStatus = document.getElementById("matchStatus");
const matchSubtext = document.getElementById("matchSubtext");
const connectionStatus = document.getElementById("connectionStatus");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");
const nextBtn = document.getElementById("nextBtn");
const micBtn = document.getElementById("micBtn");
const cameraBtn = document.getElementById("cameraBtn");
const stopBtn = document.getElementById("stopBtn");


// ==========================
// SYSTEM MESSAGE
// ==========================

function addSystemMessage(text) {

    if (!messages) return;

    const message = document.createElement("div");

    message.className = "system-message";

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}


// ==========================
// USER MESSAGE
// ==========================

function addUserMessage(text) {

    if (!messages) return;

    const message = document.createElement("div");

    message.className = "user-message";

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}


// ==========================
// START BUTTON
// ==========================

if (startBtn) {

    startBtn.addEventListener("click", async function () {

        console.log("Start button clicked");

        if (hero) {
            hero.style.display = "none";
        }

        if (chatContainer) {
            chatContainer.classList.add("active");
        }

        if (matchStatus) {
            matchStatus.textContent = "Opening camera...";
        }

        if (matchSubtext) {
            matchSubtext.textContent = "Please wait.";
        }

        if (connectionStatus) {
            connectionStatus.textContent =
                "● Camera starting";
        }

        try {

            localStream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

            console.log(
                "Camera stream received:",
                localStream
            );

            if (localVideo) {

                localVideo.srcObject =
                    localStream;

                localVideo.style.display =
                    "block";

                localVideo.style.width =
                    "100%";

                localVideo.style.height =
                    "300px";

                localVideo.style.objectFit =
                    "cover";

                await localVideo.play();
            }

            if (localPlaceholder) {
                localPlaceholder.style.display =
                    "none";
            }

            if (matchStatus) {
                matchStatus.textContent =
                    "Camera is working";
            }

            if (matchSubtext) {
                matchSubtext.textContent =
                    "Waiting for a stranger...";
            }

            if (connectionStatus) {
                connectionStatus.textContent =
                    "● Camera connected";
            }

            addSystemMessage(
                "Camera and microphone connected."
            );

            addSystemMessage(
                "Waiting for a stranger..."
            );
          joinWaitingQueue();

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            if (matchStatus) {
                matchStatus.textContent =
                    "Camera error";
            }

            if (matchSubtext) {
                matchSubtext.textContent =
                    error.name +
                    ": " +
                    error.message;
            }

            if (connectionStatus) {
                connectionStatus.textContent =
                    "● Camera unavailable";
            }

            alert(
                "Camera error:\n\n" +
                error.name +
                "\n" +
                error.message
            );
        }

    });

}


// ==========================
// REAL-TIME CHAT
// ==========================

let chatChannel = null;

function createChatChannel() {

    if (chatChannel) {
        return;
    }

    chatChannel = supabaseClient
        .channel("randomchat-messages")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_messages"
            },
            function (payload) {

                const newMessage = payload.new;

                // Don't display our own message twice
                if (
                    newMessage.sender_id ===
                    getSenderId()
                ) {
                    return;
                }

                addUserMessage(
                    "Stranger: " +
                    newMessage.message
                );
            }
        )
        .subscribe(function (status) {

            console.log(
                "Chat channel:",
                status
            );

        });
}


function getSenderId() {

    let senderId =
        localStorage.getItem(
            "randomchat_sender_id"
        );

    if (!senderId) {

        senderId =
            crypto.randomUUID();

        localStorage.setItem(
            "randomchat_sender_id",
            senderId
        );
    }

    return senderId;
}


async function sendMessage() {

    if (!messageInput) {
        return;
    }

    const text =
        messageInput.value.trim();

    if (text === "") {
        return;
    }

    const senderId =
        getSenderId();

    const { error } =
        await supabaseClient
            .from("chat_messages")
            .insert({
                room_id: "test-room",
                sender_id: senderId,
                message: text
            });

    if (error) {

        console.error(
            "Message send error:",
            error
        );

        addSystemMessage(
            "Message could not be sent."
        );

        return;
    }

    addUserMessage(text);

    messageInput.value = "";
}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );
}


if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                sendMessage();
            }

        }
    );

}


// Start listening for new messages
createChatChannel();


// ==========================
// MICROPHONE
// ==========================

if (micBtn) {

    micBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {

                alert(
                    "Start the camera first."
                );

                return;
            }

            const audioTracks =
                localStream.getAudioTracks();

            if (audioTracks.length === 0) {

                alert(
                    "No microphone found."
                );

                return;
            }

            isMuted = !isMuted;

            audioTracks.forEach(
                function (track) {

                    track.enabled =
                        !isMuted;

                }
            );

            if (isMuted) {

                micBtn.innerHTML =
                    "🎤 <span>Unmute</span>";

                connectionStatus.textContent =
                    "● Microphone muted";

            } else {

                micBtn.innerHTML =
                    "🎤 <span>Mute</span>";

                connectionStatus.textContent =
                    "● Camera connected";
            }

        }
    );

}


// ==========================
// CAMERA
// ==========================

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {

                alert(
                    "Start the camera first."
                );

                return;
            }

            const videoTracks =
                localStream.getVideoTracks();

            if (videoTracks.length === 0) {

                alert(
                    "No camera found."
                );

                return;
            }

            isCameraOff =
                !isCameraOff;

            videoTracks.forEach(
                function (track) {

                    track.enabled =
                        !isCameraOff;

                }
            );

            if (isCameraOff) {

                cameraBtn.innerHTML =
                    "📷 <span>Camera Off</span>";

                if (localVideo) {
                    localVideo.style.display =
                        "none";
                }

                if (localPlaceholder) {
                    localPlaceholder.style.display =
                        "flex";
                }

                connectionStatus.textContent =
                    "● Camera off";

            } else {

                cameraBtn.innerHTML =
                    "📷 <span>Camera</span>";

                if (localVideo) {
                    localVideo.style.display =
                        "block";
                }

                if (localPlaceholder) {
                    localPlaceholder.style.display =
                        "none";
                }

                connectionStatus.textContent =
                    "● Camera connected";
            }

        }
    );

}


// ==========================
// STOP
// ==========================

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {
                return;
            }

            localStream
                .getTracks()
                .forEach(
                    function (track) {
                        track.stop();
                    }
                );

            localStream = null;

            if (localVideo) {
                localVideo.srcObject = null;
                localVideo.style.display =
                    "none";
            }

            if (localPlaceholder) {
                localPlaceholder.style.display =
                    "flex";
            }

            if (matchStatus) {
                matchStatus.textContent =
                    "Camera stopped";
            }

            if (matchSubtext) {
                matchSubtext.textContent =
                    "Press Start Chatting to start again.";
            }

            if (connectionStatus) {
                connectionStatus.textContent =
                    "● Not connected";
            }

            isMuted = false;
            isCameraOff = false;

            if (micBtn) {
                micBtn.innerHTML =
                    "🎤 <span>Mute</span>";
            }

            if (cameraBtn) {
                cameraBtn.innerHTML =
                    "📷 <span>Camera</span>";
            }

            addSystemMessage(
                "Camera and microphone stopped."
            );

        }
    );

}


// ==========================
// NEXT
// ==========================

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        function () {

            console.log(
                "Next button clicked"
            );

            if (matchStatus) {
                matchStatus.textContent =
                    "Searching...";
            }

            if (matchSubtext) {
                matchSubtext.textContent =
                    "Looking for a stranger...";
            }

            if (connectionStatus) {
                connectionStatus.textContent =
                    "● Searching";
            }

            addSystemMessage(
                "Searching for a new stranger..."
            );

            setTimeout(
                function () {

                    if (matchStatus) {
                        matchStatus.textContent =
                            "Waiting for a stranger...";
                    }

                    if (matchSubtext) {
                        matchSubtext.textContent =
                            "No stranger connected yet.";
                    }

                    if (connectionStatus) {
                        connectionStatus.textContent =
                            "● Waiting";
                    }

                },
                2000
            );

        }
    );

}


// ==========================
// LOADED
// ==========================

console.log(
    "RandomChat script loaded successfully."
);
// ==========================
// RANDOM MATCHING
// ==========================

let myUserId = crypto.randomUUID();
let matchedUserId = null;

async function joinWaitingQueue() {

    console.log("Joining waiting queue...");

    // Check if another user is waiting
    const { data: waitingUsers, error } =
        await supabaseClient
            .from("waiting_users")
            .select("*")
            .neq("user_id", myUserId)
            .order("created_at", { ascending: true })
            .limit(1);

    if (error) {
        console.error("Queue error:", error);
        addSystemMessage("Could not find a stranger.");
        return;
    }

    // Someone is waiting
    if (waitingUsers && waitingUsers.length > 0) {

        const stranger = waitingUsers[0];

        matchedUserId = stranger.user_id;

        console.log(
            "Stranger found:",
            matchedUserId
        );

        // Remove stranger from queue
        await supabaseClient
            .from("waiting_users")
            .delete()
            .eq("user_id", matchedUserId);

        if (matchStatus) {
            matchStatus.textContent =
                "Stranger found!";
        }

        if (matchSubtext) {
            matchSubtext.textContent =
                "Connecting...";
        }

        if (connectionStatus) {
            connectionStatus.textContent =
                "● Stranger found";
        }

        addSystemMessage(
            "🎉 Stranger found! Connecting..."
        );

    } else {

        // Nobody waiting — join queue
        const { error: insertError } =
            await supabaseClient
                .from("waiting_users")
                .insert({
                    user_id: myUserId
                });

        if (insertError) {

            console.error(
                "Queue insert error:",
                insertError
            );

            addSystemMessage(
                "Could not join the waiting queue."
            );

            return;
        }

        console.log(
            "You are now waiting for a stranger."
        );

        if (matchStatus) {
            matchStatus.textContent =
                "Waiting for a stranger...";
        }

        if (matchSubtext) {
            matchSubtext.textContent =
                "Keep this page open.";
        }

        if (connectionStatus) {
            connectionStatus.textContent =
                "● Waiting";
        }

        addSystemMessage(
            "You are in the waiting queue."
        );
    }
                         }
