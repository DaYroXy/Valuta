function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

const form = document.getElementById('submit-post');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e)

    let formData = new FormData(form);

    fetch("https://valuta-hub.me/api/v1/posts/add", {
        method: "POST",
        body: formData
    }).then (res => res.json())
    .then(res => {
        
    })

    let image = form.querySelector('#preview-image');
    
    image.classList.remove('image-preview-class');
    image.src = ""

    form.reset()

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

let trend = findGetParameter("trend")
if(trend) {
    getTrendPosts(trend).then(posts => {
        if(posts.length === 0) {
            document.querySelector(".feeds").innerHTML = `<div class="no-posts">
                <i class="fa-solid fa-child"></i>
                        <p>Wow, its so empty in here...</p>
                    </div>`
            return;
        }

        posts.reverse().map(p => {
            addPost(p, false);
        })
    })

} else {

    getGlobalPosts().then(posts => {
        
        if(posts.length === 0) {
            document.querySelector(".feeds").innerHTML = `<div class="no-posts">
                <i class="fa-solid fa-child"></i>
                        <p>Wow, its so empty in here...</p>
                    </div>`
            return;
        }

        posts.reverse().map(p => {
            
            addPost(p, false);
        })
    })
}

