

// // Get Private Posts
function getProfilePosts(username) {
    fetch(`http://localhost:4200/api/v1/posts/${username}`)
    .then(posts => posts.json())
    .then(posts => {
        
        if(posts.length === 0) {
            document.querySelector(".feeds").innerHTML = `<div class="no-posts">
                <i class="fa-solid fa-child"></i>
                        <p>Wow, its so empty in here...</p>
                    </div>`
            return;
        }
    
        posts.reverse().map(p => {
            addPost(p, true);
        })
    })    
}

// Add friend 
function friend_Request(username) {
    fetch(`http://localhost:4200/api/v1/friends/add`,{
        method: "POST",
        body: JSON.stringify({"recipient" : username}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json())
    .then(res => {
        if(res.status === "success") {
            let acceptElement =  document.getElementById("acceptFriend") 
            if(acceptElement) {
                acceptElement.parentElement.innerHTML = `<button id="removeFriend" class="remove-friend" onclick="removeFriend('${username}')">Remove</button>`
                acceptElement.remove();
                return;
            }

            let addElement = document.getElementById("addFriend")
            addElement.parentElement.innerHTML = `<button class="pending-friend" >Pending</button>`
            addElement.remove();
        }
    })
}

function removeFriend(username) {
    fetch(`http://localhost:4200/api/v1/friends/remove/${username}`,{
        method: "DELETE",
    }).then(res => res.json())
    .then(res => {
        if(res.status === "success") {
            let removeElement = document.getElementById("removeFriend")
            removeElement.parentElement.innerHTML = `<button id="addFriend" onclick="friend_Request('${username}')" class="add-friend" >Add</button>`
            removeElement.remove();
        }
    })
}

function toggleMessageContainer() {
    let messageContainer = document.querySelector(".message-container-holder")
    messageContainer.classList.toggle("hide")
}


async function sendMessage(userId) {
    let message = document.querySelector(".message-input > textarea").value

    fetch(`http://localhost:4200/api/v1/messages/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            to: userId,
            content: message
        })
    }).then(res => res.json()).then(res => {
        console.log(res.stauts)
        if(res.stauts === "sucess") {
            console.log("ASd")
            window.location.href = "http://localhost:4200/messages"
        }
    })
}