 // @ts-nocheck
"use strict";

console.log("RandomChat script starting...");

// ==========================
// SUPABASE
// ==========================

const SUPABASE_URL =
    "https://nldvjwtfpcsfftddupwk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KXpzc2iNjLjAU83LM2XlNQ_PZarkf1L";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================
// USER ID
// ==========================

let myUserId =
    localStorage.getItem("randomchat_user_id");

if (!myUserId) {

    myUserId =
        crypto.randomUUID();

    localStorage.setItem(
        "randomchat_user_id",
        myUserId
    );
}


// ==========================
// STATE
// ==========================

let localStream = null;
let peerConnection = null;

let matchedUserId = null;
let roomId = null;

let isMuted = false;
let isCameraOff = false;

let matchChannel = null;
let signalChannel = null;
let chatChannel = null;


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

const remoteVideo =
    document.getElementById("remoteVideo");

const localPlaceholder =
    document.getElementById("localPlaceholder");

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


// ==========================
// MESSAGES
// ==========================

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


function addUserMessage(text) {

    if (!messages) return;

    const message =
        document.createElement("div");

    message.className =
        "user-message";

    message.textContent =
        text;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;
}


// ==========================
// STATUS
// ==========================

function setStatus(
    main,
    sub,
    connection
) {

    if (matchStatus) {
        matchStatus.textContent =
            main;
    }

    if (matchSubtext) {
        matchSubtext.textContent =
            sub;
    }

    if (connectionStatus) {
        connectionStatus.textContent =
            connection;
    }
}


// ==========================
// START CAMERA
// ==========================

async function startCamera() {

    try {

        setStatus(
            "Opening camera...",
            "Please wait.",
            "● Camera starting"
        );

        localStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

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
            "Looking for a stranger...",
            "● Camera connected"
        );

        addSystemMessage(
            "Camera and microphone connected."
        );

        return true;

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

        alert(
            "Camera error:\n\n" +
            error.name +
            "\n" +
            error.message
        );

        return false;
    }
}


// ==========================
// START BUTTON
// ==========================

if (startBtn) {

    startBtn.addEventListener(
        "click",
        async function () {

            if (hero) {
                hero.style.display =
                    "none";
            }

            if (chatContainer) {
                chatContainer.classList.add(
                    "active"
                );
            }

            const cameraStarted =
                await startCamera();

            if (!cameraStarted) {
                return;
            }

            await findMatch();
        }
    );
}


// ==========================
// WEBRTC
// ==========================

const rtcConfig = {

    iceServers: [

        {
            urls:
                "stun:stun.l.google.com:19302"
        },

        {
            urls:
                "stun:stun1.l.google.com:19302"
        }
    ]
};


function createPeerConnection() {

    if (peerConnection) {
        return;
    }

    peerConnection =
        new RTCPeerConnection(
            rtcConfig
        );


    // Send local tracks
    if (localStream) {

        localStream
            .getTracks()
            .forEach(function(track) {

                peerConnection.addTrack(
                    track,
                    localStream
                );

            });
    }


    // Receive remote tracks
    peerConnection.ontrack =
        function(event) {

            console.log(
                "Remote stream received."
            );

            if (remoteVideo) {

                remoteVideo.srcObject =
                    event.streams[0];

                remoteVideo.style.display =
                    "block";

                remoteVideo.play()
                    .catch(function(error) {

                        console.log(
                            "Remote video play:",
                            error
                        );

                    });
            }

            if (remotePlaceholder) {

                remotePlaceholder.style.display =
                    "none";
            }

            setStatus(
                "Stranger connected!",
                "You are now chatting.",
                "● Connected"
            );

            addSystemMessage(
                "🎉 Stranger connected!"
            );
        };


    // ICE candidates
    peerConnection.onicecandidate =
        async function(event) {

            if (!event.candidate) {
                return;
            }

            if (!matchedUserId) {
                return;
            }

            if (!roomId) {
                return;
            }

            const { error } =
                await supabaseClient
                    .from("signaling")
                    .insert({

                        room_id:
                            roomId,

                        sender_id:
                            myUserId,

                        receiver_id:
                            matchedUserId,

                        type:
                            "ice",

                        data:
                            event.candidate.toJSON()
                    });

            if (error) {

                console.error(
                    "ICE send error:",
                    error
                );
            }
        };


    peerConnection.onconnectionstatechange =
        function() {

            console.log(
                "WebRTC state:",
                peerConnection
                    .connectionState
            );

            if (
                peerConnection.connectionState ===
                "connected"
            ) {

                setStatus(
                    "Stranger connected!",
                    "You are now chatting.",
                    "● Connected"
                );
            }

            if (
                peerConnection.connectionState ===
                "failed"
            ) {

                setStatus(
                    "Connection failed",
                    "Try Next to find another person.",
                    "● Connection failed"
                );
            }
        };
}


// ==========================
// SIGNALING LISTENER
// ==========================

function startSignalListener() {

    if (signalChannel) {
        return;
    }

    signalChannel =
        supabaseClient
            .channel(
                "signals-" +
                myUserId
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "signaling",
                    filter:
                        "receiver_id=eq." +
                        myUserId
                },
                async function(payload) {

                    const signal =
                        payload.new;

                    if (
                        signal.room_id !==
                        roomId
                    ) {
                        return;
                    }

                    console.log(
                        "Signal received:",
                        signal.type
                    );


                    if (!peerConnection) {

                        createPeerConnection();
                    }


                    // OFFER
                    if (
                        signal.type ===
                        "offer"
                    ) {

                        await peerConnection
                            .setRemoteDescription(
                                signal.data
                            );

                        const answer =
                            await peerConnection
                                .createAnswer();

                        await peerConnection
                            .setLocalDescription(
                                answer
                            );

                        await supabaseClient
                            .from("signaling")
                            .insert({

                                room_id:
                                    roomId,

                                sender_id:
                                    myUserId,

                                receiver_id:
                                    signal.sender_id,

                                type:
                                    "answer",

                                data:
                                    answer
                            });

                        console.log(
                            "Answer sent."
                        );
                    }


                    // ANSWER
                    else if (
                        signal.type ===
                        "answer"
                    ) {

                        await peerConnection
                            .setRemoteDescription(
                                signal.data
                            );

                        console.log(
                            "Answer accepted."
                        );
                    }


                    // ICE
                    else if (
                        signal.type ===
                        "ice"
                    ) {

                        try {

                            await peerConnection
                                .addIceCandidate(
                                    signal.data
                                );

                        } catch(error) {

                            console.error(
                                "ICE error:",
                                error
                            );
                        }
                    }
                }
            )
            .subscribe(function(status) {

                console.log(
                    "Signal channel:",
                    status
                );
            });
}


// ==========================
// CREATE OFFER
// ==========================

async function createOffer() {

    if (!peerConnection) {

        createPeerConnection();
    }

    const offer =
        await peerConnection
            .createOffer();

    await peerConnection
        .setLocalDescription(
            offer
        );

    const { error } =
        await supabaseClient
            .from("signaling")
            .insert({

                room_id:
                    roomId,

                sender_id:
                    myUserId,

                receiver_id:
                    matchedUserId,

                type:
                    "offer",

                data:
                    offer
            });

    if (error) {

        console.error(
            "Offer error:",
            error
        );

        addSystemMessage(
            "Could not start video connection."
        );

        return;
    }

    console.log(
        "Offer sent."
    );
}


// ==========================
// MATCHING
// ==========================

async function findMatch() {

    setStatus(
        "Searching...",
        "Looking for a stranger...",
        "● Searching"
    );

    addSystemMessage(
        "Searching for a stranger..."
    );


    // Look for another waiting user
    const { data: waitingUsers, error } =
        await supabaseClient
            .from("waiting_users")
            .select("*")
            .neq(
                "user_id",
                myUserId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            )
            .limit(1);


    if (error) {

        console.error(
            "Waiting queue error:",
            error
        );

        addSystemMessage(
            "Matching error: " +
            error.message
        );

        return;
    }


    // ==========================
    // FOUND STRANGER
    // ==========================

    if (
        waitingUsers &&
        waitingUsers.length > 0
    ) {

        const stranger =
            waitingUsers[0];

        matchedUserId =
            stranger.user_id;


        roomId =
            [myUserId, matchedUserId]
                .sort()
                .join("-");


        // Remove stranger from queue
        await supabaseClient
            .from("waiting_users")
            .delete()
            .eq(
                "user_id",
                matchedUserId
            );


        setStatus(
            "Stranger found!",
            "Connecting...",
            "● Connecting"
        );

        addSystemMessage(
            "🎉 Stranger found!"
        );


        createPeerConnection();

        startSignalListener();

        await createOffer();

        return;
    }


    // ==========================
    // NOBODY WAITING
    // ==========================

    const { error: insertError } =
        await supabaseClient
            .from("waiting_users")
            .insert({

                user_id:
                    myUserId
            });


    if (insertError) {

        console.error(
            "Queue insert error:",
            insertError
        );

        addSystemMessage(
            "Could not join waiting queue: " +
            insertError.message
        );

        return;
    }


    setStatus(
        "Waiting for a stranger...",
        "Keep this page open.",
        "● Waiting"
    );

    addSystemMessage(
        "You are waiting for a stranger."
    );


    // Listen for matching notification
    startMatchListener();
}


// ==========================
// MATCH LISTENER
// ==========================

function startMatchListener() {

    if (matchChannel) {
        return;
    }

    matchChannel =
        supabaseClient
            .channel(
                "match-" +
                myUserId
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "match_requests",
                    filter:
                        "receiver_id=eq." +
                        myUserId
                },
                async function(payload) {

                    const match =
                        payload.new;

                    matchedUserId =
                        match.sender_id;

                    roomId =
                        match.room_id;


                    setStatus(
                        "Stranger found!",
                        "Connecting...",
                        "● Connecting"
                    );

                    addSystemMessage(
                        "🎉 Stranger found!"
                    );


                    // Remove our queue entry
                    await supabaseClient
                        .from("waiting_users")
                        .delete()
                        .eq(
                            "user_id",
                            myUserId
                        );


                    createPeerConnection();

                    startSignalListener();

                }
            )
            .subscribe(function(status) {

                console.log(
                    "Match channel:",
                    status
                );

            });
}


// ==========================
// CHAT
// ==========================

function startChatChannel() {

    if (chatChannel) {
        return;
    }

    chatChannel =
        supabaseClient
            .channel(
                "chat-" +
                myUserId
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages"
                },
                function(payload) {

                    const message =
                        payload.new;

                    if (
                        message.room_id !==
                        roomId
                    ) {
                        return;
                    }

                    if (
                        message.sender_id ===
                        myUserId
                    ) {
                        return;
                    }

                    addUserMessage(
                        "Stranger: " +
                        message.message
                    );
                }
            )
            .subscribe();
}


async function sendMessage() {

    if (!messageInput) {
        return;
    }

    const text =
        messageInput.value.trim();

    if (!text) {
        return;
    }

    if (!roomId) {

        addSystemMessage(
            "You are not connected to a stranger yet."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("chat_messages")
            .insert({

                room_id:
                    roomId,

                sender_id:
                    myUserId,

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
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                sendMessage();
            }
        }
    );
}


// ==========================
// MICROPHONE
// ==========================

if (micBtn) {

    micBtn.addEventListener(
        "click",
        function() {

            if (!localStream) {

                alert(
                    "Start the camera first."
                );

                return;
            }


            isMuted =
                !isMuted;


            localStream
                .getAudioTracks()
                .forEach(function(track) {

                    track.enabled =
                        !isMuted;

                });


            micBtn.innerHTML =
                isMuted
                    ? "🎤 <span>Unmute</span>"
                    : "🎤 <span>Mute</span>";
        }
    );
}


// ==========================
// CAMERA
// ==========================

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        function() {

            if (!localStream) {

                alert(
                    "Start the camera first."
                );

                return;
            }


            isCameraOff =
                !isCameraOff;


            localStream
                .getVideoTracks()
                .forEach(function(track) {

                    track.enabled =
                        !isCameraOff;

                });


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
        async function() {

            if (localStream) {

                localStream
                    .getTracks()
                    .forEach(function(track) {

                        track.stop();

                    });

                localStream = null;
            }


            if (peerConnection) {

                peerConnection.close();

                peerConnection = null;
            }


            if (remoteVideo) {

                remoteVideo.srcObject =
                    null;

                remoteVideo.style.display =
                    "none";
            }


            if (remotePlaceholder) {

                remotePlaceholder.style.display =
                    "flex";
            }


            // Remove ourselves from queue
            await supabaseClient
                .from("waiting_users")
                .delete()
                .eq(
                    "user_id",
                    myUserId
                );


            matchedUserId =
                null;

            roomId =
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


            setStatus(
                "Camera stopped",
                "Press Start Chatting to start again.",
                "● Not connected"
            );


            addSystemMessage(
                "Camera and connection stopped."
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
        async function() {

            // Close current connection
            if (peerConnection) {

                peerConnection.close();

                peerConnection = null;
            }


            if (remoteVideo) {

                remoteVideo.srcObject =
                    null;

                remoteVideo.style.display =
                    "none";
            }


            if (remotePlaceholder) {

                remotePlaceholder.style.display =
                    "flex";
            }


            matchedUserId =
                null;

            roomId =
                null;


            setStatus(
                "Searching...",
                "Looking for a new stranger...",
                "● Searching"
            );


            addSystemMessage(
                "Searching for a new stranger..."
            );


            await findMatch();
        }
    );
}


// ==========================
// START CHAT LISTENER
// ==========================

startChatChannel();

console.log(
    "RandomChat script loaded successfully."
);
