const express = require ("express");
const router = express.Router();
const Post = require("../classes/post");

router.use(require("./users.routes"));


// Get All Posts 
router.get("/posts", (req, res) => {
    let posts = [
        {
            avatar: "basha.jpeg",
            name: "bashar shaabi",
            createdAt: 1659096727871,
            rank: "student",
            image: "feed-2.jpg",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Blanditiis deserunt facere, repellendus nostrum unde sunt sequi obcaecati dolorem vero repellat."
        }
    ]

    res.json(posts)
})

// Get All rooms 
router.get("/rooms", (req, res) => {
    let rooms = [
        {
            name: "Global",
            description: "Feel free to talk whatever you like.",
            messages_count: 99
        },
        {
            name: "Software Engineering",
            description: "Software Engineering topics only.",
            messages_count: 61
        },
        {
            name: "Designing",
            description: "We talk about UX, UI, and Designing.",
            messages_count: 99
        },

    ]
    res.json(rooms)
})

// Get All rooms 
router.get("/rooms", (req, res) => {
    let rooms = [
        {
            name: "Global",
            description: "Feel free to talk whatever you like.",
            messages_count: 99
        },
        {
            name: "Software Engineering",
            description: "Software Engineering topics only.",
            messages_count: 61
        },
        {
            name: "Designing",
            description: "We talk about UX, UI, and Designing.",
            messages_count: 99
        },

    ]
    res.json(rooms)
})


// Post to db

router.post("/post", (req, res) => {
    // var io = req.app.get('socketio');
    // console.log(req.session)
    console.log(req.body)
    // console.log(req.files)
    res.json({
        status: "success",
        message: "Post created successfully"
    })
    return;
    const data = req.body;
    // if()
    
    let post = new Post({
        user_id: 1,
        content: "This is a random post.",
        image: "",
        createdAt: new Date().getTime()
    });

    post = post.post()
    post = Object.assign({ 
        name: "bashar shaabi",
        rank: "student",
        avatar: "anas.jpeg"}, post)


    io.emit("newPost", post)
    res.json({
        "status": "success",
        "message": "Post created successfully."
    })
})

module.exports=router;
