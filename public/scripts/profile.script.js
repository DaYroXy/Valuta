
// // Get Private Posts
function getProfilePosts(username) {
    fetch(`http://localhost:4200/api/v1/posts/${username}`)
    .then(posts => posts.json())
    .then(posts => {
        console.log(posts)
        if(posts.length === 0) {
            document.querySelector(".feeds").innerHTML = `<div class="no-posts">
                <i class="fa-solid fa-child"></i>
                        <p>Wow, its so empty in here...</p>
                    </div>`
            return;
        }
    
        posts.map(p => {
            addPost(p);
        })
    })    
}
