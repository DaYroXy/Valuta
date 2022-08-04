

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



// Add post to page
function addPost(data) {
    let img = ""
    let user_avatar = data.user.avatar

    if(user_avatar.includes("http") || user_avatar.includes("https")){
        user_avatar = data.user.avatar
    }   else{
        user_avatar = `http://localhost:4200/images/${data.user.avatar}`
    }

    let createdAt = timeSince(new Date(data.createdAt));
    if(data.image !== "") {
        img = `<img src="./images/${data.image}" alt="feed-content-image">`
    }
    let connectedUserInfo = document.querySelector(".profile-details > .handle");
    let logged_user_username = connectedUserInfo.textContent.toLocaleLowerCase()

    let editMenu = ""
    if(logged_user_username == data.user.name.toLocaleLowerCase()) {
        editMenu = `
        <div class="edit-menu show">
            <ul>
                <li><button onclick="deletePost('${data._id}')" >Delete</button></li>
            </ul>
        </div>
        `
    }

    let html = `
        <div class="feed" data-id="${data._id}">
                <div class="feed-top">
                    <div class="user">
                        <div class="pfp-container">
                            <div class="profile-picture">
                                <img src="${user_avatar}" alt="user profile picture">
                            </div>
                        </div>

                        <div class="info">
                            <div class="info-name-container">
                                <h3>${data.user.name}</h3>
                                <small><a href="http://localhost:4200/profile/${data.user.username}">@${data.user.username}</a></small>
                            </div>
                            <small> <span createdAt="${data.createdAt}">${createdAt}</span>, <span class="${data.rank.name}">${data.rank.name}</span></small>
                        </div>
                    </div>
                    <span class="edit">
                        <i onclick="toggleMenuList(this)" class="fa-solid fa-ellipsis fa-lg"></i>
                        ${editMenu}
                    </span>
                </div>

                <div class="feed-content">
                    <small>${data.content}</small>
                    <div class="feed-photo">
                        ${img}
                    </div>
                </div>
                
                <div class="action-button">
                    <span><i class="fa-regular fa-heart fa-xl"></i></span>
                    <span><i class="fa-regular fa-comment fa-xl"></i></span>
                    <span><i class="fa-regular fa-share-from-square fa-xl"></i></span>
                </div>

            </div>
        `;
    document.querySelector(".feeds")
    .insertAdjacentHTML("afterbegin", html)
}

// Get Global Posts
async function getGlobalPosts() {
    let posts = await (await fetch("http://localhost:4200/api/v1/posts")).json();
    return posts;
}

// Get Global Posts

async function getTrendPosts(trendName) {
    let posts = await (await fetch(`http://localhost:4200/api/v1/posts/trends/${trendName}`)).json();
    return posts;
}


function toggleMenuList(event) {
    let element = event.parentElement.querySelector(".edit-menu");
    element.classList.toggle("show");
}

function deletePost(postId) {
    fetch(`http://localhost:4200/api/v1/posts/delete/${postId}`, {
        method: "DELETE",
    }).then(res => res.json())
    .then(res => {
        
    })
}

 // Listen for new posts from the server
 socket.on("newPost", (post) => {
    let noPosts = document.querySelector('.no-posts');
    if(noPosts !== null) {
        noPosts.remove();
    }

    addPost(post);
});

socket.on("postDeleted", (post) => {
    let postElement = document.querySelector(`[data-id="${post}"]`);
    postElement.remove();
    
    try{
        trendsElement.innerHTML = "";
        getTrendsAndAddtoDom()
    } catch(err) {
        
    }

    if(document.querySelectorAll(".feeds > .feed").length == 0) {

        document.querySelector(".feeds").innerHTML = 
        `<div class="no-posts">
            <i class="fa-solid fa-child"></i>
                <p>Wow, its so empty in here...</p>
            </div>  
        `;
    }

})


setInterval(() => {
    try {
        let timeList = document.querySelectorAll("[createdAt]")

        timeList.forEach(time => {
            let since = timeSince(new Date(time.getAttribute("createdAt")))
            time.textContent = since;
        })

    } catch (err) {
        
    }
}, 10000);