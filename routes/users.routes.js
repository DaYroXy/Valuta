const express = require ("express");
const router = express.Router();
const User = require("../classes/user");

router.get("/refresh", async (req, res) => {
    const user = req.session.user
    if(!user) {
        res.redirect("/entry")
        return;
    }

    const {username} = req.params;
    let me = new User();
    await me.getUserById(user.id);

    req.session.user.posts_count = await me.getUserPostsCount();
    req.session.user.friends_count = await me.getFriendsCount();
    
    res.json({
        status: "success",
        message: "Refreshed",
    })
})


module.exports=router;