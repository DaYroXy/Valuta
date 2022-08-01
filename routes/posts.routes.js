const express = require ("express");
const Post = require("../classes/post");
const userClass = require("../classes/user");
const router = express.Router();


// Get my posts
router.get("/me", async (req,res) => {
    const userSession = req.session.user;
    
    if(!userSession) {
        res.json({
            status: "error",
            message: "You are not logged in"
        })
        return;
    }

    const user = new userClass();
    await user.getUserById(userSession.id);
    // console.log(user.getUser())
    res.json(await user.getUserPosts());
})

// Get All Posts 
router.get("/", async (req, res) => {
    let posts = new Post();
    console.log(posts)
    // posts = await posts.getPosts();

    res.json(await posts.getPosts())
})


// Post to db
router.post("/add", async (req, res) => {
    var io = req.app.get('io');
    const user = req.session.user;

    // if user isnet logged in
    if(!user) {
        res.json({
            status: "error",
            message: "You are not logged in"
        })
        return;
    }
    
    // Create the post data
    const postData = {
        content: req.body.content,
        image: "",
        file: ""
    }

    // if user sent a file or image
    if(req.files) {
        if('image' in req.files) {
            const image = req.files.image;
            postData.image = image.name;
        }

        if('file' in req.files) {
            const file = req.files.file;
            postData.file = file.name;
        }
    }

    const post = new Post();
    await post.setUserById(user.id);
    
    return;
    await post.postData(postData);
    
    if(!await post.isValid()) {
        res.json({
            status: "error",
            message: "Something went wrong"
        })
        return;
    }

    // let getPost = getPostById(post);
    
    let postResult = await post.post();
    const postToEmit = {
        content: postResult.data.content,
        createdAt: postResult.data.createdAt,
        file: postResult.data.file,
        image: postResult.data.image,
        user: {
            _id: postResult.data.userId,
            avatar: user.avatar,
            name: user.name,
            rank: user.rank,
            username: user.username,
        },
        _id: postResult.data._id,
    }

    if(!postResult.status === "sucess") {
        res.redirect(`/?error=${postResult.message}`)
        return
    }
    io.emit("newPost", postToEmit)
    res.redirect(`/?success=${postResult.message}`);
})



module.exports=router;