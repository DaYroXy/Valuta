async function getRelatedPosts() {
    const mainPostId = document.querySelector(".profile-information .feed").getAttribute("data-id")
    let posts = await (await fetch(`http://localhost:4200/api/v1/posts/comments/${mainPostId}`)).json();
    return posts;

}


// getRelatedPosts()
getRelatedPosts().then(posts => {
        
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


const form = document.getElementById('submit-post');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e)

    let formData = new FormData(form);
    fetch("http://localhost:4200/api/v1/posts/add", {
        method: "POST",
        body: formData
    }).then (res => res.json())
    .then(res => {
        console.log(res)
    })

    // let image = form.querySelector('#preview-image');
    
    // image.classList.remove('image-preview-class');
    // image.src = ""

    // form.reset()

})

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