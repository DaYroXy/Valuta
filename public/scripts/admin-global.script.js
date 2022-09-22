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


function loadMessage(message) {
  let messageContainer = document.querySelector(".admin-chat-content .middle")
  let html = `
  <div class="user-message">
    <div class="message">
        <p><b>${message.user.name}</b> ${message.content}</p>
        <small class="text-muted">${timeSince(new Date(message.createdAt))}</small>
    </div>
  </div>
  `

  messageContainer.insertAdjacentHTML('beforeend', html)
  messageContainer.insertAdjacentHTML("beforeend", `<div class="scroll-to-bottom"></div>`);
  document.querySelector(".scroll-to-bottom").scrollIntoView();
  messageContainer.querySelector(".scroll-to-bottom").remove();
}

function loadAllMessages() {
  let messageContainer = document.querySelector(".admin-chat-content .middle")
  let roomUID = messageContainer.getAttribute("room-uid")
  fetch(`https://valuta-hub.me/api/v1/rooms/messages/${roomUID}`)
  .then(res => res.json()).then(res => {
      console.log(res)
      res.forEach(message => {
          loadMessage(message)
      })
  })
}

loadAllMessages()

function sendMessage(roomId) {
    let message = document.querySelector("#admin-chat-message")
    if(!message) {
        console.log("cannot find element.");
        return;
    }
    message = message.value
    fetch(`https://valuta-hub.me/api/v1/messages/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            to: roomId,
            content: message
        })
    }).then(res => res.json()).then(res => {
        console.log(res)
        document.querySelector("#admin-chat-message").value = ""
    })
}

const API_FETCH_URL = "https://valuta-hub.me/api/v1/admin/activity";
const activities_element = document.querySelector(".activities");

async function getRecentActivities(limit) {
    const response = await fetch(`${API_FETCH_URL}/${limit}`);
    const data = await response.json();
    return data;
}

fetch(`${API_FETCH_URL}/3`).then(res => res.json()).then(res => {
    let HTML = "";
    res.forEach(activity => {
        let userAvatar = `https://valuta-hub.me/${activity.user.avatar}`;
        
        if(activity.user.avatar.includes("http") || activity.user.avatar.includes("https")) {
            userAvatar = `${activity.user.avatar}`;
        }

        HTML += `
        <div class="activity">
            <div class="profile-picture">
                <img src="${userAvatar}" alt="">
            </div>
            <div class="message">
                <p><b>${activity.user.name}</b> ${activity.message}</p>
                <small class="text-muted">${timeSince(new Date(activity.createdAt))}</small>
            </div>
        </div>
        `
    });
    activities_element.innerHTML = HTML;
})


