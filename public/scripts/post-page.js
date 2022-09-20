getGlobalPosts().then(posts => {
        
    if(posts.length === 0) {
        document.querySelector(".feeds").innerHTML = `<div class="no-posts">
            <i class="fa-solid fa-child"></i>
                    <p>Wow, its so empty in here...</p>
                </div>`
        return;
    }

    posts.reverse().map(p => {
        
        addPost(p);
    })
})