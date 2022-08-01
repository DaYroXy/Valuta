function getPosts() {
    fetch("/api/v1/rooms")
    .then(res => res.json())
    .then(res => {
        let html = res.map(p => {
        return `
        <div class="user-message">
            <div class="message-details">
                <div class="message-content">
                    <h5>${p.name}<small class="notification-count">${p.messages_count}</small></h5>
                </div>
                
                <small class="text-muted">${p.description}</small>
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
        document.querySelector(".messages-container")
        .insertAdjacentHTML("afterbegin", html)
    })
}

getPosts()