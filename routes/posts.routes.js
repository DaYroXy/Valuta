const express = require ("express");
const router = express.Router();

const userClass = require("../classes/user");
const Post = require("../classes/post");

// Get All Posts 
router.get("/", async (req, res) => {
    res.json(await new Post().getPosts())
})


router.get("/me", async(req, res) => {
    const userSession = req.session.user;

    if(!userSession) {
        res.json({
            status: "error",
            message: "User not found"
        })
    }

    const userPosts = new userClass();
    await userPosts.getUserById(userSession.id)
    res.json(await userPosts.Posts())
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
        _id: postResult.data.userId,
        avatar: user.avatar,
        name: user.name,
        username: user.username,
        rank: user.rank,
        post: {
            _id: postResult.data._id,
            content: postResult.data.content,
            image: postResult.data.image,
            file: postResult.data.file,
        },
        createdAt: postResult.data.createdAt
    }

    if(!postResult.status === "sucess") {
        res.redirect(`/?error=${postResult.message}`)
        return
    }
    io.emit("newPost", postToEmit)
    res.redirect(`/?success=${postResult.message}`);
})


module.exports=router;
