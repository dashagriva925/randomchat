// @ts-nocheck
"use strict";

console.log("RandomChat script loaded");

// ==========================
// SUPABASE
// ==========================

const SUPABASE_URL = "https://nldvjwtfpcsfftddupwk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KXpzc2iNjLjAU83LM2XlNQ_PZarkf1L";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


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


// ==========================
// VARIABLES
// ==========================

let localStream = null;

let peerConnection = null;

let matchedUserId = null;

let roomId = null;

let isMuted = false;

let isCameraOff = false;

let isSearching = false;

let queueChannel = null;

let signalingChannel = null;

let chatChannel = null;


// ==========================
// USER ID
// ==========================

let myUserId =
    localStorage.getItem(
        "randomchat_user_id"
    );

if (!myUserId) {

    myUserId =
        crypto.randomUUID();

    localStorage.setItem(
        "randomchat_user_id",
        myUserId
    );
}


// ==========================
// WEBRTC SETTINGS
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
    status,
    subtext,
    connection
) {

    if (matchStatus) {

        matchStatus.textContent =
            status;
    }

    if (matchSubtext) {

        matchSubtext.textContent =
            subtext;
    }

    if (connectionStatus) {

        connectionStatus.textContent =
            connection;
    }
}


// ==========================
// CAMERA
// ==========================

async function startCamera() {

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

        await localVideo.play()
            .catch(() => {});
    }


    if (localPlaceholder) {

        localPlaceholder.style.display =
            "none";
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
}


// ==========================
// STOP CAMERA
// ==========================

function stopCamera() {

    if (localStream) {

        localStream
            .getTracks()
            .forEach(
                track => track.stop()
            );
    }


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
}


// ==========================
// CLOSE PEER
// ==========================

function closePeerConnection() {

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
}


// ==========================
// CREATE PEER CONNECTION
// ==========================

function createPeerConnection() {

    if (peerConnection) {

        return peerConnection;
    }


    peerConnection =
        new RTCPeerConnection(
            rtcConfig
        );


    // Add our camera and microphone

    if (localStream) {

        localStream
            .getTracks()
            .forEach(track => {

                peerConnection.addTrack(
                    track,
                    localStream
                );

            });
    }


    // Receive stranger video

    peerConnection.ontrack =
        function(event) {

            console.log(
                "Remote stream received"
            );


            if (!remoteVideo) {

                return;
            }


            remoteVideo.srcObject =
                event.streams[0];

            remoteVideo.style.display =
                "block";


            if (remotePlaceholder) {

                remotePlaceholder.style.display =
                    "none";
            }


            remoteVideo
                .play()
                .catch(() => {});


            setStatus(

                "Stranger connected!",

                "You are now chatting.",

                "● Connected"

            );
        };


    // Send ICE candidate

    peerConnection.onicecandidate =
        async function(event) {

            if (!event.candidate) {

                return;
            }


            if (
                !roomId ||
                !matchedUserId
            ) {

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
                            event.candidate
                                .toJSON()

                    });


            if (error) {

                console.error(
                    "ICE error:",
                    error
                );
            }
        };


    // Connection state

    peerConnection
        .onconnectionstatechange =
        function() {

            if (!peerConnection) {

                return;
            }


            console.log(
                "WebRTC:",
                peerConnection
                    .connectionState
            );


            if (
                peerConnection
                    .connectionState ===
                "connected"
            ) {

                setStatus(

                    "Stranger connected!",

                    "You are now chatting.",

                    "● Connected"

                );
            }


            if (
                peerConnection
                    .connectionState ===
                "failed"
            ) {

                setStatus(

                    "Connection failed",

                    "Press Next to try again.",

                    "● Connection failed"

                );
            }
        };


    return peerConnection;
}


// ==========================
// ROOM ID
// ==========================

function createRoomId(
    user1,
    user2
) {

    return [
        user1,
        user2
    ]
        .sort()
        .join("_");
}


// ==========================
// SEND SIGNAL
// ==========================

async function sendSignal(
    type,
    data
) {

    if (
        !roomId ||
        !matchedUserId
    ) {

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
                    type,

                data:
                    data

            });


    if (error) {

        console.error(
            "Signal error:",
            error
        );
    }
}


// ==========================
// CREATE OFFER
// ==========================

async function createOffer() {

    const pc =
        createPeerConnection();


    const offer =
        await pc.createOffer();


    await pc.setLocalDescription(
        offer
    );


    await sendSignal(
        "offer",
        {

            type:
                offer.type,

            sdp:
                offer.sdp

        }
    );


    console.log(
        "Offer sent"
    );
}


// ==========================
// SIGNALING
// ==========================

function startSignaling() {

    if (signalingChannel) {

        supabaseClient
            .removeChannel(
                signalingChannel
            );
    }


    signalingChannel =
        supabaseClient

            .channel(
                "signaling-" +
                myUserId
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "signaling",

                    filter:
                        "receiver_id=eq." +
                        myUserId

                },

                async function(payload) {

                    const signal =
                        payload.new;


                    if (!signal) {

                        return;
                    }


                    if (
                        signal.room_id !==
                        roomId
                    ) {

                        return;
                    }


                    const pc =
                        createPeerConnection();


                    try {

                        // OFFER

                        if (
                            signal.type ===
                            "offer"
                        ) {

                            await pc
                                .setRemoteDescription(

                                    new RTCSessionDescription(
                                        signal.data
                                    )

                                );


                            const answer =
                                await pc
                                    .createAnswer();


                            await pc
                                .setLocalDescription(
                                    answer
                                );


                            await sendSignal(
                                "answer",
                                {

                                    type:
                                        answer.type,

                                    sdp:
                                        answer.sdp

                                }
                            );
                        }


                        // ANSWER

                        else if (
                            signal.type ===
                            "answer"
                        ) {

                            await pc
                                .setRemoteDescription(

                                    new RTCSessionDescription(
                                        signal.data
                                    )

                                );
                        }


                        // ICE

                        else if (
                            signal.type ===
                            "ice"
                        ) {

                            await pc
                                .addIceCandidate(

                                    new RTCIceCandidate(
                                        signal.data
                                    )

                                );
                        }

                    }
                    catch(error) {

                        console.error(
                            "Signal handling error:",
                            error
                        );
                    }

                }

            )

            .subscribe(
                function(status) {

                    console.log(
                        "Signaling:",
                        status
                    );

                }
            );
}


// ==========================
// REMOVE FROM QUEUE
// ==========================

async function removeFromQueue() {

    const { error } =
        await supabaseClient
            .from("waiting_users")
            .delete()
            .eq(
                "user_id",
                myUserId
            );


    if (error) {

        console.error(
            "Queue delete:",
            error
        );
    }
}


// ==========================
// FIND WAITING USER
// ==========================

async function findWaitingUser() {

    if (
        !isSearching ||
        matchedUserId
    ) {

        return;
    }


    const { data, error } =
        await supabaseClient

            .from("waiting_users")

            .select(
                "user_id, created_at"
            )

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
            "Queue search:",
            error
        );

        return;
    }


    // Someone waiting

    if (
        data &&
        data.length > 0
    ) {

        const stranger =
            data[0];


        matchedUserId =
            stranger.user_id;


        roomId =
            createRoomId(
                myUserId,
                matchedUserId
            );


        isSearching =
            false;


        await supabaseClient

            .from("waiting_users")

            .delete()

            .eq(
                "user_id",
                matchedUserId
            );


        await removeFromQueue();


        setStatus(

            "Stranger found!",

            "Connecting...",

            "● Stranger found"

        );


        addSystemMessage(
            "🎉 Stranger found! Connecting..."
        );


        startSignaling();


        createPeerConnection();


        // Only one person creates offer

        if (
            myUserId <
            matchedUserId
        ) {

            await createOffer();
        }


        return;
    }


    // Nobody waiting

    await joinQueue();
}


// ==========================
// JOIN QUEUE
// ==========================

async function joinQueue() {

    if (
        !isSearching ||
        matchedUserId
    ) {

        return;
    }


    const { data, error } =
        await supabaseClient

            .from("waiting_users")

            .select("user_id")

            .eq(
                "user_id",
                myUserId
            );


    if (error) {

        console.error(
            "Queue check:",
            error
        );

        return;
    }


    if (
        data &&
        data.length > 0
    ) {

        return;
    }


    const { error: insertError } =
        await supabaseClient

            .from("waiting_users")

            .insert({

                user_id:
                    myUserId

            });


    if (insertError) {

        console.error(
            "Queue insert:",
            insertError
        );

        addSystemMessage(
            "Could not join waiting queue."
        );

        return;
    }


    setStatus(

        "Waiting for a stranger...",

        "Keep this page open.",

        "● Waiting"

    );


    addSystemMessage(
        "You are in the waiting queue."
    );
}


// ==========================
// QUEUE REALTIME
// ==========================

function startQueueListener() {

    if (queueChannel) {

        supabaseClient
            .removeChannel(
                queueChannel
            );
    }


    queueChannel =
        supabaseClient

            .channel(
                "queue-" +
                myUserId
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "waiting_users"

                },

                function() {

                    if (
                        isSearching &&
                        !matchedUserId
                    ) {

                        findWaitingUser();
                    }

                }

            )

            .subscribe(
                function(status) {

                    console.log(
                        "Queue:",
                        status
                    );

                }
            );
}


// ==========================
// START MATCHING
// ==========================

async function startMatching() {

    isSearching =
        true;

    matchedUserId =
        null;

    roomId =
        null;


    startQueueListener();


    await findWaitingUser();
}


// ==========================
// CHAT REALTIME
// ==========================


function startChatRealtime() {

    if (chatChannel) {

        supabaseClient
            .removeChannel(
                chatChannel
            );
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

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "chat_messages"

                },

                function(payload) {

                    const msg =
                        payload.new;


                    if (!msg) {

                        return;
                    }


                    if (
                        msg.sender_id ===
                        myUserId
                    ) {

                        return;
                    }


                    if (
                        roomId &&
                        msg.room_id !==
                        roomId
                    ) {

                        return;
                    }


                    addUserMessage(
                        "Stranger: " +
                        msg.message
                    );

                }

            )

            .subscribe(
                function(status) {

                    console.log(
                        "Chat:",
                        status
                    );

                }
            );
}

// ==========================
// SEND CHAT MESSAGE
// ==========================

async function sendMessage() {

    if (!messageInput) {

        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {

        return;
    }


    if (
        !roomId ||
        !matchedUserId
    ) {

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


    addUserMessage(
        text
    );


    messageInput.value =
        "";
}


// ==========================
// START BUTTON
// ==========================

if (startBtn) {

    startBtn.addEventListener(
        "click",
        async function() {

            if (localStream) {

                return;
            }


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

                "Please wait.",

                "● Camera starting"

            );


            try {

                await startCamera();


                setStatus(

                    "Camera is working",

                    "Looking for a stranger...",

                    "● Camera connected"

                );


                addSystemMessage(
                    "Camera and microphone connected."
                );


                startChatRealtime();


                await startMatching();

            }
            catch(error) {

                console.error(
                    "Camera error:",
                    error
                );


                setStatus(

                    "Camera error",

                    error.name +
                    ": " +
                    error.message,

                    "● Camera unavailable"

                );


                alert(

                    "Camera error:\n\n" +
                    error.name +
                    "\n" +
                    error.message

                );
            }

        }
    );
  
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


            const tracks =
                localStream
                    .getAudioTracks();


            if (!tracks.length) {

                alert(
                    "No microphone found."
                );

                return;
            }


            isMuted =
                !isMuted;


            tracks.forEach(
                function(track) {

                    track.enabled =
                        !isMuted;

                }
            );


            micBtn.innerHTML =
                isMuted

                ? "🎤 <span>Unmute</span>"

                : "🎤 <span>Mute</span>";


            connectionStatus.textContent =
                isMuted

                ? "● Microphone muted"

                : (
                    matchedUserId
                    ? "● Connected"
                    : "● Waiting"
                );

        }
    );
}


// ==========================
// CAMERA BUTTON
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


            const tracks =
                localStream
                    .getVideoTracks();


            if (!tracks.length) {

                alert(
                    "No camera found."
                );

                return;
            }


            isCameraOff =
                !isCameraOff;


            tracks.forEach(
                function(track) {

                    track.enabled =
                        !isCameraOff;

                }
            );


            cameraBtn.innerHTML =
                isCameraOff

                ? "📷 <span>Camera Off</span>"

                : "📷 <span>Camera</span>";


            if (localVideo) {

                localVideo.style.display =
                    isCameraOff
                    ? "none"
                    : "block";
            }


            if (localPlaceholder) {

                localPlaceholder.style.display =
                    isCameraOff
                    ? "flex"
                    : "none";
            }

        }
    );
}

// ==========================
// STOP BUTTON
// ==========================

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        async function() {

            isSearching =
                false;


            await removeFromQueue();


            if (queueChannel) {

                supabaseClient
                    .removeChannel(
                        queueChannel
                    );

                queueChannel =
                    null;
            }


            if (signalingChannel) {

                supabaseClient
                    .removeChannel(
                        signalingChannel
                    );

                signalingChannel =
                    null;
            }


            closePeerConnection();


            stopCamera();


            matchedUserId =
                null;

            roomId =
                null;

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

        }
    );
}


// ==========================
// NEXT BUTTON
// ==========================

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        async function() {

            if (!localStream) {

                alert(
                    "Start the camera first."
                );

                return;
            }


            await removeFromQueue();


            closePeerConnection();


            matchedUserId =
                null;

            roomId =
                null;

            isSearching =
                true;


            setStatus(

                "Searching...",

                "Looking for a stranger...",

                "● Searching"

            );


            addSystemMessage(
                "Searching for a new stranger..."
            );


            await startMatching();

        }
    );
}


// ==========================
// SUPABASE TEST
// ==========================

async function testSupabase() {

    const { error } =
        await supabaseClient

            .from("chat_messages")

            .select("*")

            .limit(1);


    if (error) {

        console.error(
            "Supabase connection error:",
            error
        );

    }
    else {

        console.log(
            "Supabase connected successfully."
        );
    }
}


testSupabase();
