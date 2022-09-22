
async function getFriends() {
    await fetch("https://valuta-hub.me/api/v1/friends/get").then((friends=> (friends.json())
    .then(friends => {
        const friendsElement = document.querySelector(".friends-list");
        
        if(!friendsElement) {
            return;
        }
        friendsElement.innerHTML = "";

        friends.map(friend => {
            friend = friend.user
            let avatar = ""
            if(friend.avatar.includes("http") || friend.avatar.includes("https")) {
                avatar = `<img src="${friend.avatar}" alt="user profile picture">`
            }else {
                avatar = `<img src="https://valuta-hub.me/uploads/${friend.avatar}" alt="user profile picture">`
            }

            let onlineStatus = `<p class="text-muted offline">Offline</p>`
            if(friend.sockets_id.length > 0) {
                onlineStatus = `<p class="text-muted online">Online</p>`
            }

            html = `
            <div class="friend">
                <div class="profile-picture">
                    ${avatar}
                </div>

                <div class="friend-body">
                    <h5>${friend.name}</h5>
                    <p class="text-muted online">${onlineStatus}</p>
                </div>
            </div>
            `;

            friendsElement.insertAdjacentHTML("beforeend", html)
        })
    })))
}

socket.on("user-connected", (user) => {
    getFriends();
})

socket.on("user-disconnected", (user) => {
    let pageReload = false
    setTimeout(() => {
        getFriends();
    }, 5000);

})



