function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;
    if(seconds === 0) {
        return 1 + " SECOND AGO"; 
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

    return Math.floor(seconds) + " SECONDS AGO";
  }

function addPost(post) {
    let img = ""
    console.log(post)
    let createdAt = timeSince(new Date(post.createdAt));
    if(post.image !== "") {
        img = `<img src="./images/${post.image}" alt="feed-content-image">`
    }

    let html = `
        <div class="feed">
                <div class="feed-top">
                    <div class="user">
                        <div class="pfp-container">
                            <div class="profile-picture">
                                <img src="./images/${post.user.avatar}" alt="user profile picture">
                            </div>
                        </div>

                        <div class="info">
                            <h3>${post.user.name}</h3>
                            <small>${createdAt}, <span class="student">${post.user.rank}</span></small>
                        </div>
                    </div>
                    <span class="edit"><i class="fa-solid fa-ellipsis fa-lg"></i></span>
                </div>

                <div class="feed-content">
                    <small>${post.content}</small>
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
    let posts = await (await fetch("/api/v1/post/")).json();
    return posts;
}

// Get Private Posts
function getProfilePosts() {
    fetch("/api/v1/post")
    .then(res => res.json())
    .then(res => {
        addPost(res);
    })
}