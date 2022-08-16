function loadMessages(uid) {
    let results = document.querySelectorAll(".sent-message, .recieved-message")
    
    if(results.length > 0) {
        results.forEach(r => {
            r.remove();
        })
    }

    fetch(`https://valuta-hub.me/api/v1/messages/get/${uid}`)
    .then(res => res.json())
    .then(res => {
        console.log(res)
        if(res.length === 0) {
            return;
        }
        let MessagesContent = document.querySelector(".chatting-messages");
        res.data.forEach(message => {
            let html;

            if(message.from === uid) {
                html = `
                <div class="recieved-message">
                    <div class="recieved-message-content">
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
                html =`
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
            }

            MessagesContent.insertAdjacentHTML("afterbegin", html)
        })
        document.querySelector(".chatting-messages").insertAdjacentHTML("afterend", `<div class="scroll-to-bottom"></div>`)
        document.querySelector(".scroll-to-bottom").scrollIntoView()
    })
   
}

function updateChatInfo(user) {
    let userTopElement = document.querySelector(".right-side > .right-side-top");
    let userAvatar = userTopElement.querySelector(".profile-picture > img");
    let userName = userTopElement.querySelector(".profile-details > h4");
    let userStatus = userTopElement.querySelector(".profile-details > p");
    let button = document.querySelector('#send-message-button');
    button.innerHTML = ''
    let uid = user.id || user.user_id
    button.innerHTML = `
    <i id="send-message-button-uid" user-data="${uid}" onclick='sendMessage("${uid}")' class="fa-solid fa-paper-plane fa-lg"></i>`
    userName.textContent = user.name;

    if(user.avatar.includes("http") || user.avatar.includes("https")) {
        userAvatar.src = `${user.avatar}`;
    }else {
        userAvatar.src = `https://valuta-hub.me/${user.avatar}`;
    }

    if(user.sockets.length > 0) {
        userStatus.classList.add("online");
        userStatus.textContent = `online`;
    } else {
        userStatus.classList.add("offline");
        userStatus.innerHTML = `offline`;
    }

    loadMessages(uid);
}


function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;
    if(seconds === 0) {
        return "A FEW SECOND AGO"; 
    }

    if (interval > 1) {
      return Math.floor(interval) + " YEARS AGO";
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " MONTHS AGO";
    }

    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " DAYS AGO";
    }

    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " HOURS AGO";
    }

    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " MINUTES AGO";
    }

    return "A FEW SECOND AGO"; 
  }

function getMessagesList() {
    fetch("https://valuta-hub.me/api/v1/messages/get")
    .then(res => res.json())
    .then(res => {
        if(res.length === 0) {
            let img = document.querySelector("body > main > div > div.right-side > div.right-side-top > div > div.profile-picture > img")
            img.remove()
            let notFoundHtml = `<div class="no-posts">
            <i class="fa-solid fa-child"></i>
                    <p>Wow, its so empty in here...</p>
                </div>` 
                document.querySelector(".messages-list")
        .insertAdjacentHTML("afterbegin", notFoundHtml)
        document.querySelector("body > main > div > div.right-side > div.right-side-top > div > div.profile-details > h4").textContent = "No user found"
            return;
        }
        let html = res.map(user => {
            console.log(user)
            let image = `<img src="./uploads/${user.avatar}" alt="profile picutre">`
            if(user.avatar.includes("http") || user.avatar.includes("https")) {
                image = `<img src="${user.avatar}" alt="profile picutre">`
            }
        return `
        <div onclick="updateCurrentChat('${user.user_id}')" class="user-message">
            <div class="profile-picture">
                ${image}
            </div>

            <div class="message-details">
                <div class="message-content">
                    <h5>${user.name}</h5>
                    <small>${timeSince(new Date(user.createdAt))}</small>
                </div>
                
                <small class="text-muted">${user.content}</small>
            </div>                        
        </div>
            `;
        }).join("")

        if(html === "") {
            html = `<div class="no-posts">
                <i class="fa-solid fa-child"></i>
                        <p>Wow, its so empty in here...</p>
                    </div>`
        }
        document.querySelector(".messages-list")
        .insertAdjacentHTML("afterbegin", html)

        if(res.length > 0){
            updateChatInfo(res[0])
        }
    })
}

async function updateCurrentChat(userId) {
    fetch(`https://valuta-hub.me/api/v1/messages/get/${userId}`)
    .then(res => res.json())
    .then(res => {
        updateChatInfo(res.user)
    })
}

getMessagesList()


let friendsSearchMessage = document.getElementById("friends-search-messages");
if(friendsSearchMessage){


    friendsSearchMessage.addEventListener("keyup", (e) => {
        let friendsSearchMessage = document.querySelectorAll(".user-message");

        let Found = []
        friendsSearchMessage.forEach(friend => {
            const friendName = friend.querySelector("h5").textContent
            if(friendName.toLowerCase().startsWith(e.target.value.toLowerCase())) {
                Found.push(friend)
                friend.style.display = ""
            } else {
                friend.style.display = "none"
            }
        })

        let NoResults = document.querySelector(".no-results-found")
        if(Found.length === 0 && !NoResults) {
            let NoResults = `
                <div class="no-results-found">
                    <h5>No results found.</h5>
                </div>
            `

            document.querySelector(".messages-list").insertAdjacentHTML("beforeend", NoResults)
        }

        if(Found.length > 0 && NoResults) {
            NoResults.remove();
        }

    })

}

socket.on("new_message", (uid) => {
    if(document.querySelector("#send-message-button-uid").getAttribute("user-data") === uid) {
        loadMessages(uid)
    }
})


async function sendMessage(userId) {
    let message = document.getElementById("create-post").value;
    fetch(`https://valuta-hub.me/api/v1/messages/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            to: userId,
            content: message
        })
    }).then(res => res.json()).then(res => {
        document.querySelector('#create-post').value = ""
        loadMessages(userId)
    })
}