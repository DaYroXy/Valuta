const express = require ("express");
const router = express.Router();

const rankModel = require("../models/Rank.model");
const userClass = require("../classes/user");
const Post = require("../classes/post");
const Trend = require("../classes/trend");
const ObjectId = require('mongoose').Types.ObjectId;
const Activity = require("../classes/activity.js");

// Get All Posts 
router.get("/", async (req, res) => {
    res.json(await new Post().getPosts())
})


// Get logged user data
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

// Get username data
router.get("/:username", async(req, res) => {
    const userSession = req.session.user;
    const username = req.params.username;
    if(!userSession) {
        res.json({
            status: "error",
            message: "User not found"
        })
    }

    const userPosts = new userClass();
    await userPosts.getUserByUsername(username);
    res.json(await userPosts.Posts())
})

// add post to db
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
    let isImage, isFile;
    if(req.files) {
        if('image' in req.files) {
            const image = req.files.image;
            if(image.mimetype.includes("image")) {
                let filterdImage = image.name.split(".");
                postData.image = `${image.md5}.${filterdImage[filterdImage.length - 1]}`;
                isImage = true;
            } else {
                res.json({
                    status: "error",
                    message: "must send an image"
                })
                return;
            }
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

    // move the image to the uploads folder
    if(isImage) {
        req.files.image.mv(`public/uploads/${postData.image}`, async (err) => {
            if(err) {
                res.json(err)
                return;
            }
        })    
    }

    // let getPost = getPostById(post);
    let postResult = await post.post();
    
    if(postResult.status !== "sucess") {
        res.json({
            "status": "error",
            "message": "post added successfully"
        });
        return
    }

    const userRank = new userClass();
    await userRank.getUserById(user.id);

    const postToEmit = {
        _id: postResult.data._id,
        content: postResult.data.content,
        image: postResult.data.image,
        file: postResult.data.file,
        createdAt: postResult.data.createdAt,
        user: {
            avatar: user.avatar,
            name: user.name,
            username: user.username,
        },
        rank: {
            name : (await userRank.getUserRank()).name
        }
    }

    console.log(user.rank);

    // emit post to all users
    io.emit("newPost", postToEmit)

    // Add to trends
    const trend = new Trend();
    let trends = trend.getTrendsByText(postData.content);
    
    
    if(trends != '') {
        trends.forEach(async t => {
            await trend.addTrend(t)
            await trend.addTrendToPost(postToEmit._id, t);
            io.emit("newTrend", await trend.getTrend(t));
        })
    }
    req.session.user.posts_count += 1;

    new Activity(user.id, 1);

    res.json({
        "status": "success",
        "message": "post added successfully"
    });
})

// Delete post
router.delete("/delete/:postId", async (req, res) => {
    const io = req.app.get('io');

    const user = req.session.user;
    if(!user) {
        res.json({
            status: "error",
            message: "You are not logged in"
        })
        return;
    }

    const { postId } = req.params;
    if(!postId || !ObjectId.isValid(postId)) {
        res.json({
            status: "error",
            message: "Post id not found"
        })
        return;
    }

    let post = new Post();
    
    let postData = await post.getPostById(postId)

    if(postData.userId != user.id) {
        res.json({
            status: "error",
            message: "You are not allowed to delete this post, tryna hack huh?"
        })
        return;
    }

    if(postData.trendId.length > 0) {
        postData.trendId.forEach(async trend => {
            let trendClass = new Trend();
            await trendClass.getTrendById(trend)
            trendClass.remove();
        })
    }

    await post.delete()

    const postToEmit = {
        id: postId,
        name: user.name,
    }

    io.emit("postDeleted", postToEmit)
    req.session.user.posts_count -= 1;

    new Activity(user.id, 2);
    res.json({
        status: "success",
        message: "post removed sucessfully"
    })

})


// Get trend posts data
router.get("/trends/:trend", async(req, res) => {
    const trend = req.params.trend || nulll;

    if(trend === null) {
        res.json({
            status: "error",
            message: "Trend not found"
        })
    }

    let post = new Post();
    res.json((await post.getPostsByTrend(trend)))
})


// Like Post

router.post("/like/:postId", async (req, res) => {
    const io = req.app.get('io');
    const user = req.session.user;
    if(!user) {
        res.json({
            status: "error",
            message: "You are not logged in"
        })
        return;
    }

    const { postId } = req.params;
    if(!postId || !ObjectId.isValid(postId)) {
        res.json({
            status: "error",
            message: "Post id not found"
        })
        return;
    }

    let post = new Post();
    await post.setUserById(user.id);

    let result = await post.like(postId);
    const postToEmit = {
        id: postId,
        userId: user.id,
        status: ("message" in result) ? result.message : "post-liked"
    }
    io.emit("postLiked", postToEmit)
    res.json({
        status: "success",
        message: "post liked sucessfully"
    })
})


module.exports=router;
