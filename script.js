// ==============================
// RANDOMCHAT - PHASE 1
// SUPABASE + CAMERA
// ==============================

"use strict";

console.log("RandomChat Phase 1 loaded");


// ==============================
// SUPABASE
// ==============================

const SUPABASE_URL =
    "https://nldvjwtfpcsfftddupwk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KXpzc2iNjLjAU83LM2XlNQ_PZarkf1L";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==============================
// ELEMENTS
// ==============================

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

const matchStatus =
    document.getElementById("matchStatus");

const matchSubtext =
    document.getElementById("matchSubtext");

const connectionStatus =
    document.getElementById("connectionStatus");

const messages =
    document.getElementById("messages");


// ==============================
// CAMERA VARIABLES
// ==============================

let localStream = null;


// ==============================
// SYSTEM MESSAGE
// ==============================

function addSystemMessage(text) {

    if (!messages) return;

    const message =
        document.createElement("div");

    message.className =
        "system-message";

    message.textContent =
        text;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;
}


// ==============================
// STATUS
// ==============================

function setStatus(
    title,
    subtitle,
    connection
) {

    if (matchStatus) {
        matchStatus.textContent =
            title;
    }

    if (matchSubtext) {
        matchSubtext.textContent =
            subtitle;
    }

    if (connectionStatus) {
        connectionStatus.textContent =
            connection;
    }
}


// ==============================
// START CHAT
// ==============================

if (startBtn) {

    startBtn.addEventListener(
        "click",
        startChat
    );

}


// ==============================
// START CAMERA
// ==============================

async function startChat() {

    console.log(
        "Start Chatting clicked"
    );

    if (hero) {
        hero.style.display =
            "none";
    }

    if (chatContainer) {
        chatContainer.classList.add(
            "active"
        );
    }

    setStatus(
        "Opening camera...",
        "Please allow camera and microphone.",
        "● Starting"
    );

    try {

        localStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: true,

                    audio: true

                });


        console.log(
            "Camera and microphone started"
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


        setStatus(
            "Camera is working",
            "Waiting for a stranger...",
            "● Camera connected"
        );


        addSystemMessage(
            "Camera and microphone connected."
        );


        console.log(
            "PHASE 1 SUCCESS"
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        setStatus(
            "Camera error",
            error.name + ": " + error.message,
            "● Camera unavailable"
        );


        addSystemMessage(
            "Camera error: " +
            error.message
        );


        alert(
            "Camera error\n\n" +
            error.name +
            "\n" +
            error.message
        );

    }

}


// ==============================
// SUPABASE TEST
// ==============================

async function testSupabase() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("waiting_users")
            .select("*")
            .limit(1);


    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        return;

    }


    console.log(
        "Supabase connected:",
        data
    );

}


testSupabase();


// ==============================
// END PHASE 1
// ==============================

console.log(
    "Phase 1 ready."
);
// ==============================
// RANDOMCHAT - PHASE 2
// MICROPHONE + CAMERA + STOP
// ==============================

let isMuted = false;
let isCameraOff = false;

const micBtn =
    document.getElementById("micBtn");

const cameraBtn =
    document.getElementById("cameraBtn");

const stopBtn =
    document.getElementById("stopBtn");


// ==============================
// MICROPHONE
// ==============================

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


            if (
                audioTracks.length === 0
            ) {

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


// ==============================
// CAMERA ON / OFF
// ==============================

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


            if (
                videoTracks.length === 0
            ) {

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


// ==============================
// STOP CAMERA + MICROPHONE
// ==============================

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


            localStream =
                null;


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


            isMuted =
                false;

            isCameraOff =
                false;


            if (micBtn) {

                micBtn.innerHTML =
                    "🎤 <span>Mute</span>";

            }


            if (cameraBtn) {

                cameraBtn.innerHTML =
                    "📷 <span>Camera</span>";

            }


            setStatus(
                "Camera stopped",
                "Press Start Chatting to start again.",
                "● Not connected"
            );


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
    "Phase 2 loaded successfully."
);
// ==============================
// RANDOMCHAT - PHASE 3
// REAL-TIME TEXT CHAT
// ==============================

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

let chatChannel = null;


// ==============================
// USER ID
// ==============================

function getChatUserId() {

    let id =
        localStorage.getItem(
            "randomchat_chat_user_id"
        );

    if (!id) {

        id =
            crypto.randomUUID();

        localStorage.setItem(
            "randomchat_chat_user_id",
            id
        );

    }

    return id;
}


// ==============================
// ADD CHAT MESSAGE
// ==============================

function addChatMessage(
    text,
    sender
) {

    if (!messages) return;

    const message =
        document.createElement("div");

    if (sender === "me") {

        message.className =
            "user-message";

        message.textContent =
            text;

    } else {

        message.className =
            "user-message";

        message.textContent =
            "Stranger: " + text;

    }

    messages.appendChild(
        message
    );

    messages.scrollTop =
        messages.scrollHeight;
}


// ==============================
// SEND MESSAGE
// ==============================

async function sendMessage() {

    if (!messageInput) {
        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    const senderId =
        getChatUserId();


    const {
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .insert({

                room_id:
                    "public-chat",

                sender_id:
                    senderId,

                message:
                    text

            });


    if (error) {

        console.error(
            "Message error:",
            error
        );

        addSystemMessage(
            "Message could not be sent."
        );

        return;
    }


    addChatMessage(
        text,
        "me"
    );


    messageInput.value =
        "";

}


// ==============================
// SEND BUTTON
// ==============================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// ==============================
// ENTER KEY
// ==============================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// ==============================
// REAL-TIME CHAT
// ==============================

function startChatRealtime() {

    if (chatChannel) {
        return;
    }


    chatChannel =
        supabaseClient
            .channel(
                "randomchat-chat-" +
                getChatUserId()
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


                    // Don't show our own message twice
                    if (
                        newMessage.sender_id ===
                        getChatUserId()
                    ) {

                        return;

                    }


                    addChatMessage(
                        newMessage.message,
                        "stranger"
                    );

                }
            )
            .subscribe(
                function (status) {

                    console.log(
                        "Chat realtime:",
                        status
                    );

                }
            );

}


// Start realtime chat
startChatRealtime();


console.log(
    "Phase 3 loaded successfully."
);
