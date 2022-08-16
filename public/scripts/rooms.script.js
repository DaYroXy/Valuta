

// on user change messages UI
function changeRoom(roomId) {
    fetch(`http://localhost:4200/api/v1/rooms/${roomId}`)
    .then(res => res.json())
    .then(data => {

        // Change room name and description
        document.getElementById('current-room-name').textContent = data.name
        document.getElementById('current-room-description').textContent = data.description
        
        // reset send button
        let sendButtonParent = document.getElementById('current-room-send').parentElement
        sendButtonParent.innerHTML = ""
        sendButtonParent.innerHTML = `<i class="fa-solid fa-paper-plane fa-lg" id="current-room-send" room-data="${roomId}" onclick="sendMessage('${roomId}')"></i>`
        
        // load room messages
        loadMessages(roomId);
    })
    
}

// send message on user send
function sendMessage(roomId) {
    let message = document.querySelector("#create-post")
    if(!message) {
        console.log("cannot find element.");
        return;
    }
    message = message.value
    console.log(message, roomId)
    fetch(`http://localhost:4200/api/v1/messages/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            to: roomId,
            content: message
        })
    }).then(res => res.json()).then(res => {
        document.querySelector('#create-post').value = ""
        console.log(res)
    })
}

// Add display Message to UI
function displayMessage(message) {
    // get current user id
    let userId = document.querySelector("#user-id").getAttribute("user-id")
    let messagesElement = document.querySelector(".chatting-messages");

    let html = ``;
    // if message is from current user use different style
    if(userId === message.user._id) {
        html = `
        <div class="sent-message">
            <div class="sent-message-content">
                <div class="inner-message-content">
                    <p>${message.content}</p>
                </div>

                <div class="message-timestamp">
                    <small class="text-muted">${timeSince(new Date(message.createdAt))}</small>
                </div>
            </div>
        </div>
        `
    } else {
        let img = `<img src="./images/${message.user.avatar} alt="profile picutre"></img>`
        // ${message.user.name}

        if(message.user.avatar.includes("http") || message.user.avatar.includes("https") ) {
            img = `<img src="${message.user.avatar}" alt="profile picutre"></img>`
        }

        html = `
        <div class="recieved-message">
                  
            <div class="recieved-message-content">
                
                <div class="inner-message-content">
                        <div class="profile-picture">
                            ${img}
                        </div>
                    <div class="message-details">
                        <h5>${message.user.name} <div class="message-timestamp"> <small class="text-muted">${timeSince(new Date(message.createdAt))}</small></div> </h5>
                        <p>${message.content}</p>
                    </div>
                </div>
            </div>
        </div>
        `
    }

    messagesElement.insertAdjacentHTML("beforeend", html);
    messagesElement.insertAdjacentHTML("beforeend", `<div class="scroll-to-bottom"></div>`);
    document.querySelector(".scroll-to-bottom").scrollIntoView();
    messagesElement.querySelector(".scroll-to-bottom").remove();


}

// load messages on user change
function loadMessages(roomId) {
    fetch(`http://localhost:4200/api/v1/rooms/messages/${roomId}`)
    .then(res => res.json())
    .then(messages => {
        
        // clear all existing messages
        let messagesElement = document.querySelector(".chatting-messages");
        messagesElement.innerHTML = ""

        // load new messages
        messages.forEach(message => {
            displayMessage(message);
        })

    }).catch(err => {
        console.log(err)
    })
}

let rooms = document.querySelectorAll("#room-menu-select");
changeRoom(rooms[0].getAttribute("room-data"))


// on message recieved
socket.on("new_room_message", (message) => {
    console.log(message)
    let roomId = document.querySelector("#current-room-send").getAttribute("room-data")
    if(message.room_id !== roomId) {
        return;
    }

    displayMessage(message);
})