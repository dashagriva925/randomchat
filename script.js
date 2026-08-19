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
