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
        startRandomMatching();


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
 // ==========================================
// RANDOMCHAT - PHASE 3
// FIXED REAL-TIME CHAT
// ==========================================

let chatChannel = null;
let chatReady = false;


// ==========================================
// GET ELEMENTS
// ==========================================

const chatInput =
    document.getElementById("messageInput");

const chatSendButton =
    document.getElementById("sendBtn");


// ==========================================
// UNIQUE USER ID
// ==========================================

function getChatUserId() {

    let id =
        localStorage.getItem(
            "randomchat_user_id"
        );

    if (!id) {

        id =
            crypto.randomUUID();

        localStorage.setItem(
            "randomchat_user_id",
            id
        );
    }

    return id;
}


// ==========================================
// SHOW MESSAGE
// ==========================================

function displayChatMessage(
    text,
    mine
) {

    if (!messages) {

        console.error(
            "Messages container not found"
        );

        return;
    }


    const message =
        document.createElement("div");


    message.className =
        "user-message";


    if (mine) {

        message.textContent =
            text;

    } else {

        message.textContent =
            "Stranger: " + text;

    }


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;
}


// ==========================================
// START REALTIME CHAT
// ==========================================

function connectChat() {

    console.log(
        "Connecting to chat..."
    );


    if (chatChannel) {

        supabaseClient.removeChannel(
            chatChannel
        );

        chatChannel =
            null;
    }


    chatChannel =
        supabaseClient.channel(
            "randomchat-main-room",
            {
                config: {
                    broadcast: {
                        self: true
                    }
                }
            }
        );


    // ------------------------------
    // RECEIVE MESSAGES
    // ------------------------------

    chatChannel.on(
        "broadcast",
        {
            event: "message"
        },
        function (payload) {

            console.log(
                "RECEIVED:",
                payload
            );


            const data =
                payload.payload;


            if (!data) {
                return;
            }


            const myId =
                getChatUserId();


            // Don't display our own
            // broadcast twice

            if (
                data.sender_id ===
                myId
            ) {

                return;
            }


            displayChatMessage(
                data.text,
                false
            );

        }
    );


    // ------------------------------
    // SUBSCRIBE
    // ------------------------------

    chatChannel.subscribe(
        function (status) {

            console.log(
                "CHAT STATUS:",
                status
            );


            if (
                status ===
                "SUBSCRIBED"
            ) {

                chatReady =
                    true;


                console.log(
                    "CHAT CONNECTED!"
                );


                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Chat connected";

                }

            }


            if (
                status ===
                "CHANNEL_ERROR"
            ) {

                chatReady =
                    false;


                console.error(
                    "CHAT CHANNEL ERROR"
                );


                if (connectionStatus) {

                    connectionStatus.textContent =
                        "● Chat connection error";

                }

            }


            if (
                status ===
                "TIMED_OUT"
            ) {

                chatReady =
                    false;


                console.error(
                    "CHAT TIMED OUT"
                );

            }

        }
    );

}


// ==========================================
// SEND CHAT MESSAGE
// ==========================================

async function sendChatMessage() {

    console.log(
        "SEND BUTTON PRESSED"
    );


    if (!chatInput) {

        console.error(
            "messageInput not found"
        );

        return;
    }


    const text =
        chatInput.value.trim();


    if (!text) {

        return;
    }


    if (!chatChannel ||
        !chatReady) {

        console.log(
            "Chat not ready"
        );


        if (connectionStatus) {

            connectionStatus.textContent =
                "● Connecting chat...";

        }


        return;
    }


    const data = {

        sender_id:
            getChatUserId(),

        text:
            text

    };


    console.log(
        "SENDING:",
        data
    );


    try {

        const result =
            await chatChannel.send({

                type:
                    "broadcast",

                event:
                    "message",

                payload:
                    data

            });


        console.log(
            "SEND RESULT:",
            result
        );


        if (
            result &&
            result !== "ok"
        ) {

            console.error(
                "Broadcast error:",
                result
            );

            return;
        }


        // Show our own message
        displayChatMessage(
            text,
            true
        );


        chatInput.value =
            "";


    } catch (error) {

        console.error(
            "MESSAGE SEND ERROR:",
            error
        );

    }

}


// ==========================================
// SEND BUTTON
// ==========================================

if (chatSendButton) {

    chatSendButton.onclick =
        sendChatMessage;

}


// ==========================================
// ENTER KEY
// ==========================================

if (chatInput) {

    chatInput.onkeydown =
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendChatMessage();

            }

        };

}


// ==========================================
// START
// ==========================================

connectChat();


console.log(
    "PHASE 3 FIXED CHAT LOADED"
);
// ==========================================
// PHASE 4 - RANDOM MATCHING
// PART 1
// ==========================================

let currentUserId =
    localStorage.getItem("randomchat_user_id");

if (!currentUserId) {
    currentUserId = crypto.randomUUID();

    localStorage.setItem(
        "randomchat_user_id",
        currentUserId
    );
}


// ==========================================
// JOIN WAITING QUEUE
// ==========================================

async function joinWaitingQueue() {

    console.log(
        "Joining waiting queue..."
    );

    // Remove old entry first
    await supabaseClient
        .from("waiting_users")
        .delete()
        .eq(
            "user_id",
            currentUserId
        );


    // Add this user
    const { error } =
        await supabaseClient
            .from("waiting_users")
            .insert({

                user_id:
                    currentUserId

            });


    if (error) {

        console.error(
            "QUEUE INSERT ERROR:",
            error
        );

        addSystemMessage(
            "Could not join matching queue."
        );

        return false;
    }


    console.log(
        "Successfully joined waiting queue."
    );


    return true;
}


// ==========================================
// CHECK WAITING USERS
// ==========================================

async function getWaitingUsers() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("waiting_users")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "QUEUE READ ERROR:",
            error
        );

        return [];
    }


    return data || [];
}


// ==========================================
// TEST MATCH SEARCH
// ==========================================

async function findWaitingUser() {

    const users =
        await getWaitingUsers();


    console.log(
        "WAITING USERS:",
        users
    );


    const otherUser =
        users.find(
            user =>
                user.user_id !==
                currentUserId
        );


    if (!otherUser) {

        console.log(
            "No other user waiting."
        );

        return null;
    }


    console.log(
        "FOUND OTHER USER:",
        otherUser.user_id
    );


    return otherUser;
}


console.log(
    "PHASE 4 PART 1 LOADED"
);
// ==========================================
// PHASE 4 - PART 2
// START RANDOM MATCHING
// ==========================================

let matchingInterval = null;

async function startRandomMatching() {
  console.log("PHASE 4 PART 2: Starting random matching...");

  setStatus(
    "Looking for a stranger...",
    "Waiting for another user...",
    "🟡 Searching"
  );

  // Join the waiting queue
  const joined = await joinWaitingQueue();

  if (!joined) {
    console.error("Could not join waiting queue.");
    setStatus(
      "Matching error",
      "Could not join the waiting queue.",
      "🔴 Error"
    );
    return;
  }

  console.log("Joined waiting queue successfully.");

  // Check for another user
  await checkForMatch();

  // Keep checking until a stranger is found
  if (!matchingInterval) {
    matchingInterval = setInterval(async () => {
      await checkForMatch();
    }, 2000);
  }
}


// ==========================================
// CHECK FOR A MATCH
// ==========================================

async function checkForMatch() {
  try {
    const stranger = await findWaitingUser();

    if (!stranger) {
      console.log("No stranger found yet...");
      return;
    }

    console.log("STRANGER FOUND:", stranger);

    // Stop checking
    if (matchingInterval) {
      clearInterval(matchingInterval);
      matchingInterval = null;
    }

    setStatus(
      "Stranger found!",
      "You are now connected.",
      "🟢 Connected"
    );

    addSystemMessage("You are now connected to a stranger.");

  } catch (error) {
    console.error("Matching error:", error);
  }
}
// ==========================================
// PHASE 4 - PART 2
// RANDOM MATCHING
// ==========================================

let matchingInterval = null;
let matchedUserId = null;

async function startRandomMatching() {

    console.log(
        "PHASE 4 PART 2: STARTING MATCHING"
    );

    const joined =
        await joinWaitingQueue();

    if (!joined) {

        console.error(
            "Could not join waiting queue."
        );

        return;
    }

    console.log(
        "Waiting for another user..."
    );

    addSystemMessage(
        "🔍 Searching for a stranger..."
    );

    // Check immediately
    checkForMatch();

    // Keep checking every 2 seconds
    if (!matchingInterval) {

        matchingInterval =
            setInterval(
                checkForMatch,
                2000
            );
    }
}


// ==========================================
// CHECK FOR STRANGER
// ==========================================

async function checkForMatch() {

    try {

        const stranger =
            await findWaitingUser();

        if (!stranger) {

            return;
        }


        console.log(
            "🎉 STRANGER FOUND:",
            stranger.user_id
        );


        matchedUserId =
            stranger.user_id;


        // Stop checking
        if (matchingInterval) {

            clearInterval(
                matchingInterval
            );

            matchingInterval =
                null;
        }


        // Remove stranger from queue
        const { error } =
            await supabaseClient
                .from("waiting_users")
                .delete()
                .eq(
                    "user_id",
                    matchedUserId
                );


        if (error) {

            console.error(
                "MATCH DELETE ERROR:",
                error
            );

            return;
        }


        console.log(
            "Users matched successfully."
        );


        addSystemMessage(
            "🎉 Stranger found!"
        );


        setStatus(
            "Stranger found!",
            "You are now connected.",
            "● Connected"
        );


    } catch (error) {

        console.error(
            "MATCHING ERROR:",
            error
        );

    }
}


console.log(
    "PHASE 4 PART 2 LOADED"
);
