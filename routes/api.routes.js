const express = require ("express");
const router = express.Router();
const userClass = require("../classes/user");

router.use("/user", require("./users.routes"));
router.use("/post", require("./posts.routes"));
router.use("/entry", require("./entry.routes"));

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
    
})

module.exports=router;
