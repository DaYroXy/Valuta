function textAreaAdjust(element) {
    element.style.height = "1px";
    element.style.height = (10+element.scrollHeight)+"px";
}


const imgPreview = document.getElementById('create-post-image')
// .image-preview-class
imgPreview.onchange = evt => {
    const [file] = imgPreview.files

    if (file) {
        const prvw = document.getElementById('preview-image')
        prvw.classList.add('image-preview-class');
        prvw.src = URL.createObjectURL(file)
    }
}

getGlobalPosts().then(posts => {
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

// Socket Io Conenction
const socket = io("http://localhost:4200");

const userId = document.getElementById("user-id").innerHTML;
socket.emit("logged-in", (userId));

// Listen for new posts from the server
socket.on("newPost", (post) => {
    let noPosts = document.querySelector('.no-posts');
    if(noPosts !== null) {
        noPosts.remove();
    }
    addPost(post);
});