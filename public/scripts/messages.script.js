
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
    fetch("http://localhost:4200/api/v1/messages/get")
    .then(res => res.json())
    .then(res => {
        let html = res.map(user => {
            let image = `<img src="./images/${user.avatar}" alt="profile picutre">`
            if(user.avatar.includes("http") || user.avatar.includes("https")) {
                image = `<img src="${user.avatar}" alt="profile picutre">`
            }
        return `
        <div class="user-message">
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
    })
}

getMessagesList()