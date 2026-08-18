// @ts-nocheck
"use strict";

console.log("RandomChat script started");

// ==========================
// SUPABASE
// ==========================

const SUPABASE_URL =
    "https://nldvjwtfpcsfftddupwk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KXpzc2iNjLjAU83LM2XlNQ_PZarkf1L";

let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log("Supabase initialized");

} else {

    console.error(
        "Supabase library not loaded"
    );
}


// ==========================
// VARIABLES
// ==========================

let localStream = null;
let isMuted = false;
let isCameraOff = false;


// ==========================
// ELEMENTS
// ==========================

const startBtn =
    document.getElementById("startBtn");

const hero =
    document.querySelector(".hero");

const chatContainer =
    document.getElementById("chatContainer");

const localVideo =
    document.getElementById("localVideo");

const localPlaceholder =
    document.getElementById("localPlaceholder");

const remoteVideo =
    document.getElementById("remoteVideo");

const remotePlaceholder =
    document.getElementById("remotePlaceholder");

const matchStatus =
    document.getElementById("matchStatus");

const matchSubtext =
    document.getElementById("matchSubtext");

const connectionStatus =
    document.getElementById("connectionStatus");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const nextBtn =
    document.getElementById("nextBtn");

const micBtn =
    document.getElementById("micBtn");

const cameraBtn =
    document.getElementById("cameraBtn");

const stopBtn =
    document.getElementById("stopBtn");

console.log("Elements loaded");
// ==========================
// SYSTEM MESSAGE
// ==========================

function addSystemMessage(text) {

    if (!messages) return;

    const message =
        document.createElement("div");

    message.className =
        "system-message";

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;
}


// ==========================
// USER MESSAGE
// ==========================

function addUserMessage(text) {

    if (!messages) return;

    const message =
        document.createElement("div");

    message.className =
        "user-message";

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;
}


// ==========================
// START CHAT
// ==========================

if (startBtn) {

    startBtn.addEventListener(
        "click",
        async function () {

            console.log(
                "START BUTTON CLICKED"
            );

            // Hide home screen
            if (hero) {
                hero.style.display =
                    "none";
            }

            // Show chat screen
            if (chatContainer) {

                chatContainer.classList.add(
                    "active"
                );

                chatContainer.style.display =
                    "flex";
            }

            if (matchStatus) {
                matchStatus.textContent =
                    "Opening camera...";
            }

            if (matchSubtext) {
                matchSubtext.textContent =
                    "Please allow camera and microphone.";
            }

            if (connectionStatus) {
                connectionStatus.textContent =
                    "● Starting";
            }

            try {

                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices.getUserMedia
                ) {

                    throw new Error(
                        "Camera access is not supported by this browser."
                    );
                }

                console.log(
                    "Requesting camera permission..."
                );

                localStream =
                    await navigator.mediaDevices
                        .getUserMedia({
                            video: true,
                            audio: true
                        });

                console.log(
                    "Camera permission granted"
                );

                // Show local camera
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

                    try {

                        await localVideo.play();

                    } catch (videoError) {

                        console.log(
                            "Video autoplay:",
                            videoError
                        );
                    }
                }

                // Hide camera placeholder
                if (localPlaceholder) {

                    localPlaceholder.style.display =
                        "none";
                }

                // Update status
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

                startWaiting();

            } catch (error) {

                console.error(
                    "CAMERA ERROR:",
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
                    "Camera could not start.\n\n" +
                    error.name +
                    "\n" +
                    error.message
                );
            }
        }
    );

} else {

    console.error(
        "ERROR: startBtn not found"
    );
}


// ==========================
// WAITING
// ==========================

function startWaiting() {

    console.log(
        "Waiting for stranger..."
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
                    }

// ==========================
// SENDER ID
// ==========================

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


// ==========================
// REAL-TIME CHAT
// ==========================

let chatChannel = null;

function createChatChannel() {

    if (!supabaseClient) {

        console.error(
            "Supabase is not available"
        );

        return;
    }

    if (chatChannel) {
        return;
    }

    chatChannel =
        supabaseClient
            .channel(
                "randomchat-messages"
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages"
                },
                function (payload) {

                    const newMessage =
                        payload.new;

                    // Ignore our own message
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
            .subscribe(
                function (status) {

                    console.log(
                        "Chat channel:",
                        status
                    );
                }
            );
}


// ==========================
// SEND MESSAGE
// ==========================

async function sendMessage() {

    if (!messageInput) {
        return;
    }

    const text =
        messageInput.value.trim();

    if (text === "") {
        return;
    }

    if (!supabaseClient) {

        addSystemMessage(
            "Chat service is unavailable."
        );

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


// ==========================
// SEND BUTTON
// ==========================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );
}


// ==========================
// ENTER TO SEND
// ==========================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );
}


// ==========================
// START REAL-TIME CHAT
// ==========================

createChatChannel();

console.log(
    "Realtime chat initialized"
);
// ==========================
// MICROPHONE
// ==========================

if (micBtn) {

    micBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {

                alert(
                    "Start Chatting first."
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

            isMuted =
                !isMuted;

            audioTracks.forEach(
                function (track) {

                    track.enabled =
                        !isMuted;
                }
            );

            if (isMuted) {

                micBtn.innerHTML =
                    "🎤 <span>Unmute</span>";

                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Microphone muted";
                }

            } else {

                micBtn.innerHTML =
                    "🎤 <span>Mute</span>";

                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Camera connected";
                }
            }
        }
    );
}


// ==========================
// CAMERA ON / OFF
// ==========================

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {

                alert(
                    "Start Chatting first."
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

                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Camera off";
                }

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

                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Camera connected";
                }
            }
        }
    );
}


// ==========================
// STOP CAMERA
// ==========================

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        function () {

            if (!localStream) {

                alert(
                    "Camera is already stopped."
                );

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

                localVideo.srcObject =
                    null;

                localVideo.style.display =
                    "none";
            }

            if (localPlaceholder) {

                localPlaceholder.style.display =
                    "flex";
            }

            if (remoteVideo) {

                remoteVideo.srcObject =
                    null;

                remoteVideo.style.display =
                    "none";
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

            console.log(
                "Camera and microphone stopped"
            );
        }
    );
}

console.log(
    "Camera controls initialized"
);

// ==========================
// NEXT BUTTON
// ==========================

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        function () {

            console.log(
                "NEXT BUTTON CLICKED"
            );

            if (!localStream) {

                alert(
                    "Start Chatting first."
                );

                return;
            }

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
// FINAL CHECK
// ==========================

console.log(
    "================================"
);

console.log(
    "RandomChat script loaded successfully"
);

console.log(
    "Start button:",
    !!startBtn
);

console.log(
    "Camera:",
    !!localVideo
);

console.log(
    "Chat:",
    !!messages
);

console.log(
    "Supabase:",
    !!supabaseClient
);

console.log(
    "================================"
);
